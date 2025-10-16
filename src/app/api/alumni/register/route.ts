import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

type SourceType = 'manual' | 'google-forms'

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
  phone: string
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

interface RegisterResponse {
  message: string
  alumni: Record<string, unknown>
  error?: string
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
    const payload = await getPayloadHMR({ config: configPromise })
    const data: RegisterAlumniData = await request.json()

    if (!data.name || !data.email || !data.batch) {
      return NextResponse.json({ error: 'Nama, email, dan angkatan wajib diisi' }, { status: 400 })
    }

    if (!data.phone || !data.city) {
      return NextResponse.json({ error: 'Nomor HP dan kota wajib diisi' }, { status: 400 })
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

    const existingAlumni = await payload.find({
      collection: 'alumni',
      where: {
        'kontak.email': {
          equals: data.email.toLowerCase(),
        },
      },
    })

    if (existingAlumni.docs.length > 0) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar dalam database alumni' },
        { status: 400 },
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }

    const phoneRegex = /^[\+]?[1-9][\d]{3,14}$/
    if (!phoneRegex.test(data.phone.replace(/\s|-/g, ''))) {
      return NextResponse.json({ error: 'Format nomor HP tidak valid' }, { status: 400 })
    }

    if (data.linkedin && !data.linkedin.includes('linkedin.com')) {
      return NextResponse.json({ error: 'URL LinkedIn tidak valid' }, { status: 400 })
    }

    const currentYear = new Date().getFullYear()
    if (data.batch < 2000 || data.batch > currentYear) {
      return NextResponse.json(
        { error: `Angkatan harus antara 2000 - ${currentYear}` },
        { status: 400 },
      )
    }

    const validatedWorkFields = validateWorkFields(data.workField)
    const validatedHelpTypes = data.willingToHelp ? validateHelpTypes(data.willingToHelp) : []

    if (validatedWorkFields.length === 0) {
      return NextResponse.json({ error: 'Bidang pekerjaan tidak valid' }, { status: 400 })
    }

    const alumni = await payload.create({
      collection: 'alumni',
      data: {
        name: data.name,
        batch: data.batch,
        nim: data.nim || undefined,

        kontak: {
          location: {
            city: data.city,
            country: data.country || 'Indonesia',
          },
          phone: data.phone,
          email: data.email.toLowerCase(),
          linkedin: data.linkedin || undefined,
        },

        pekerjaan: {
          currentEmployer: data.currentEmployer,
          workField: validatedWorkFields,
          position: data.position,
        },

        jejaring: {
          contactPersonReady: data.contactPersonReady,
          alumniOfficerReady: data.alumniOfficerReady,
          otherContacts: data.otherContacts || undefined,
        },

        kontribusi: {
          willingToHelp: validatedHelpTypes,
          helpTopics: data.helpTopics || undefined,
        },

        lainnya: {
          suggestions: data.suggestions || undefined,
        },

        metadata: {
          isPublic: data.isPublic !== false,
          source: 'manual' as SourceType,
        },
      },
    })

    console.log('Alumni created successfully:', alumni.id)

    return NextResponse.json(
      {
        message: 'Data alumni berhasil didaftarkan!',
        alumni: {
          id: alumni.id,
          name: alumni.name,
          email: alumni.kontak.email,
          batch: alumni.batch,
        },
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error('Error creating alumni:', error)

    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
      }

      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Data tidak valid, periksa kembali input Anda' },
          { status: 400 },
        )
      }
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan server, silakan coba lagi' },
      { status: 500 },
    )
  }
}
