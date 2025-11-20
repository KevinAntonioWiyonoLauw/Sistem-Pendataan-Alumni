import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'

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

interface RegisterAlumniData {
  name: string
  batch: number
  nim?: string
  email: string
  phone?: string
  city: string
  country?: string
  linkedin?: string
  currentEmployer: string
  workField: string[]
  position: string
  contactPersonReady: 'ya' | 'tidak'
  alumniOfficerReady: 'ya' | 'tidak'
  otherContacts?: string
  willingToHelp?: string[]
  helpTopics?: string
  suggestions?: string
  isPublic?: boolean
}

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
      const existingResponse = await axios.get(`${STRAPI_URL}/api/alumni`, {
        params: {
          filters: {
            email: {
              $eq: data.email.toLowerCase(),
            },
          },
        },
      })

      if (existingResponse.data.data.length > 0) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar dalam database alumni' },
          { status: 400 },
        )
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

    // Create alumni in Strapi
    const alumniData = {
      data: {
        name: data.name,
        batch: data.batch,
        nim: data.nim || null,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        city: data.city,
        country: data.country || 'Indonesia',
        linkedin: data.linkedin || null,
        currentEmployer: data.currentEmployer,
        workField: validatedWorkFields,
        position: data.position,
        contactPersonReady: data.contactPersonReady,
        alumniOfficerReady: data.alumniOfficerReady,
        otherContacts: data.otherContacts || null,
        willingToHelp: validatedHelpTypes,
        helpTopics: data.helpTopics || null,
        suggestions: data.suggestions || null,
        isPublic: data.isPublic !== false,
      },
    }

    const response = await axios.post(`${STRAPI_URL}/api/alumni`, alumniData)

    console.log('Alumni created successfully:', response.data.data.id)

    return NextResponse.json(
      {
        message: 'Data alumni berhasil didaftarkan!',
        alumni: {
          id: response.data.data.id,
          name: data.name,
          email: data.email.toLowerCase(),
          batch: data.batch,
          phoneProvided: Boolean(data.phone),
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
