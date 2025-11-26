import { NextRequest, NextResponse } from 'next/server'
import type { RegisterAlumniData } from '@/types/alumni'

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'
const STRAPI_API_KEY = process.env.STRAPI_API_KEY

const VALID_HELP_TYPES = [
  'mentoring-career',
  'magang-riset',
  'beasiswa-studi',
  'networking',
] as const

type ValidHelpType = (typeof VALID_HELP_TYPES)[number]

function getFirstValidHelpType(types: string[]): ValidHelpType | null {
  for (const type of types) {
    if (VALID_HELP_TYPES.includes(type as ValidHelpType)) {
      return type as ValidHelpType
    }
  }
  return null
}

function validateHelpTypes(types: string[]): ValidHelpType[] {
  return types.filter((type) => VALID_HELP_TYPES.includes(type as ValidHelpType)) as ValidHelpType[]
}

export async function POST(request: NextRequest) {
  try {
    const data: RegisterAlumniData = await request.json()

    if (!data.name || !data.email || !data.batch) {
      return NextResponse.json({ error: 'Nama, email, dan angkatan wajib diisi' }, { status: 400 })
    }

    if (!data.city) {
      return NextResponse.json({ error: 'Kota wajib diisi' }, { status: 400 })
    }

    if (
      !data.currentEmployer ||
      !data.position ||
      !data.workField ||
      data.workField.trim() === ''
    ) {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }

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

    if (data.linkedin && !data.linkedin.includes('linkedin.com')) {
      return NextResponse.json({ error: 'URL LinkedIn tidak valid' }, { status: 400 })
    }

    const currentYear = new Date().getFullYear()
    if (data.batch < 1987 || data.batch > currentYear) {
      return NextResponse.json(
        { error: `Angkatan harus antara 1987 - ${currentYear}` },
        { status: 400 },
      )
    }

    // willingToHelp di Strapi adalah ENUM single value, bukan array
    // Ambil nilai pertama yang valid, sisanya masukkan ke helpTopics
    const validatedHelpTypes = data.willingToHelp ? validateHelpTypes(data.willingToHelp) : []
    const primaryHelpType = getFirstValidHelpType(validatedHelpTypes)

    // Gabungkan help types lainnya ke helpTopics
    const additionalHelpTypes = validatedHelpTypes.slice(1)
    const helpTypesLabels: Record<ValidHelpType, string> = {
      'mentoring-career': 'Mentoring Career',
      'magang-riset': 'Kesempatan Magang/Riset',
      'beasiswa-studi': 'Sharing Beasiswa/Studi Lanjut',
      networking: 'Networking Professional',
    }

    let combinedHelpTopics = data.helpTopics || ''
    if (additionalHelpTypes.length > 0) {
      const additionalLabels = additionalHelpTypes.map((t) => helpTypesLabels[t]).join(', ')
      combinedHelpTopics = combinedHelpTopics
        ? `${combinedHelpTopics}; Juga bersedia: ${additionalLabels}`
        : `Juga bersedia: ${additionalLabels}`
    }

    const alumniData = {
      data: {
        name: data.name,
        batch: data.batch,
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
          workField: data.workField || null,
          position: data.position || null,
        },
        jejaring: {
          contactPersonReady: data.contactPersonReady === 'ya' ? 'ya' : 'tidak',
          alumniOfficerReady: data.alumniOfficerReady === 'ya' ? 'ya' : 'tidak',
          otherContacts: data.otherContacts || null,
        },
        kontribusi: {
          // Single value untuk enum
          willingToHelp: primaryHelpType,
          helpTopics: combinedHelpTopics || null,
        },
        lainnya: {
          suggestions: data.suggestions || null,
        },
        metadata: {
          isPublic: data.isPublic ?? true,
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating alumni:', errorMessage)

    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as { response?: { data?: { error?: { message?: string } }; status?: number } })
        .response?.data?.error
    ) {
      const typedError = error as {
        response: { data: { error: { message?: string } }; status?: number }
      }
      return NextResponse.json(
        { error: typedError.response.data.error.message || 'Terjadi kesalahan server' },
        { status: typedError.response.status || 500 },
      )
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan server, silakan coba lagi' },
      { status: 500 },
    )
  }
}
