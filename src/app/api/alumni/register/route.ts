import { NextRequest, NextResponse } from 'next/server'
import type { RegisterAlumniData } from '@/types/alumni'

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'
const STRAPI_API_KEY = process.env.STRAPI_API_KEY

const VALID_WORK_FIELDS = [
  'akademisi',
  'pemerintah',
  'lembaga-pemerintah',
  'wirausaha',
  'swasta',
  'konsultan',
  'teknologi',
  'keuangan',
  'media',
  'kesehatan',
  'pendidikan',
  'nonprofit',
  'lainnya',
] as const

const VALID_HELP_TYPES = [
  'mentoring-career',
  'magang-riset',
  'beasiswa-studi',
  'networking',
] as const

function validateWorkFields(fields: string[]): Array<(typeof VALID_WORK_FIELDS)[number]> {
  return fields.filter((field) =>
    VALID_WORK_FIELDS.includes(field as (typeof VALID_WORK_FIELDS)[number]),
  ) as Array<(typeof VALID_WORK_FIELDS)[number]>
}

function validateHelpTypes(types: string[]): Array<(typeof VALID_HELP_TYPES)[number]> {
  return types.filter((type) =>
    VALID_HELP_TYPES.includes(type as (typeof VALID_HELP_TYPES)[number]),
  ) as Array<(typeof VALID_HELP_TYPES)[number]>
}

export async function POST(request: NextRequest) {
  try {
    const data: RegisterAlumniData = await request.json()

    // Validations
    if (!data.name || !data.email || !data.batch) {
      return NextResponse.json({ error: 'Nama, email, dan angkatan wajib diisi' }, { status: 400 })
    }

    if (!data.city) {
      return NextResponse.json({ error: 'Kota wajib diisi' }, { status: 400 })
    }

    if (!data.currentEmployer || !data.position || !data.workField || data.workField.length === 0) {
      return NextResponse.json(
        { error: 'Data pekerjaan (perusahaan, posisi, bidang kerja) wajib diisi' },
        { status: 400 },
      )
    }

    if (!data.contactPersonReady || !data.alumniOfficerReady) {
      return NextResponse.json(
        { error: 'Ketersediaan sebagai contact person dan pengurus alumni wajib diisi' },
        { status: 400 },
      )
    }

    // Check if email already exists
    try {
      const checkParams = new URLSearchParams({
        'filters[kontak][email][$eq]': data.email.toLowerCase(),
      })

      const existingResponse = await fetch(`${STRAPI_URL}/api/alumnis?${checkParams}`, {
        headers: {
          Authorization: `Bearer ${STRAPI_API_KEY}`,
        },
      })

      if (existingResponse.ok) {
        const existingData = await existingResponse.json()
        if (existingData.data.length > 0) {
          return NextResponse.json(
            { error: 'Email sudah terdaftar dalam database alumni' },
            { status: 400 },
          )
        }
      }
    } catch (error) {
      console.error('Error checking existing email:', error)
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }

    // Phone validation
    if (data.phone) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/
      const cleanPhone = data.phone.replace(/\s|-|\(|\)/g, '')

      if (!phoneRegex.test(data.phone) || cleanPhone.length < 7) {
        return NextResponse.json(
          {
            error: 'Format nomor HP tidak valid. Contoh: +62812345678 atau +6591234567',
          },
          { status: 400 },
        )
      }
    }

    // LinkedIn validation
    if (data.linkedin && !data.linkedin.includes('linkedin.com')) {
      return NextResponse.json({ error: 'URL LinkedIn tidak valid' }, { status: 400 })
    }

    // Batch validation
    const currentYear = new Date().getFullYear()
    if (data.batch < 1987 || data.batch > currentYear) {
      return NextResponse.json(
        { error: `Angkatan harus antara 1987 - ${currentYear}` },
        { status: 400 },
      )
    }

    const validatedWorkFields = validateWorkFields(data.workField)
    const validatedHelpTypes = data.willingToHelp ? validateHelpTypes(data.willingToHelp) : []

    if (validatedWorkFields.length === 0) {
      return NextResponse.json({ error: 'Bidang pekerjaan tidak valid' }, { status: 400 })
    }

    // Build Strapi-compatible data structure
    const alumniData = {
      data: {
        name: data.name,
        batch: data.batch,
        nim: data.nim || null,
        kontak: {
          email: data.email?.toLowerCase() || null,
          phone: data.phone || null,
          linkedin: data.linkedin || null,
          location: {
            city: data.city || null,
            country: data.country || 'Indonesia',
          },
        },
        pekerjaan: {
          currentEmployer: data.currentEmployer || null,
          workField: validatedWorkFields[0] || null,
          position: data.position || null,
        },
        jejaring: {
          contactPersonReady: data.contactPersonReady === 'ya' ? 'ya' : 'tidak',
          alumniOfficerReady: data.alumniOfficerReady === 'ya' ? 'ya' : 'tidak',
          otherContacts: data.otherContacts || null,
        },
        kontribusi: {
          willingToHelp: validatedHelpTypes[0] || null,
          helpTopics: data.helpTopics || null,
        },
        lainnya: {
          suggestions: data.suggestions || null,
        },
      },
    }

    console.log('📤 Sending to Strapi:', JSON.stringify(alumniData, null, 2))

    const response = await fetch(`${STRAPI_URL}/api/alumnis`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alumniData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Strapi error:', errorText)
      throw new Error(`Strapi API error: ${response.status}`)
    }

    const result = await response.json()

    console.log('✅ Strapi response:', JSON.stringify(result, null, 2))

    return NextResponse.json(
      {
        message: 'Data alumni berhasil didaftarkan!',
        alumni: {
          id: result.data.documentId || result.data.id,
          name: data.name,
          email: data.email?.toLowerCase(),
          batch: data.batch,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Error creating alumni:', error.message)

    if (error.response?.data?.error) {
      return NextResponse.json(
        { error: error.response.data.error.message || 'Terjadi kesalahan server' },
        { status: error.response.status || 500 },
      )
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan server, silakan coba lagi' },
      { status: 500 },
    )
  }
}
