import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

type CurrentStatus =
  | 'working'
  | 'studying'
  | 'entrepreneur'
  | 'freelancer'
  | 'job-seeking'
  | 'other'
type SourceType = 'manual' | 'google-forms'

interface RegisterAlumniData {
  name: string
  email: string
  batch: number
  phone?: string
  currentStatus?: CurrentStatus
  institution?: string
  position?: string
  location?: {
    city?: string
    country?: string
  }
  linkedin?: string
  website?: string
  isPublic?: boolean
  password?: string
}

interface RegisterResponse {
  message: string
  alumni: Record<string, unknown>
  error?: string
  requirePassword?: boolean
  email?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const data: RegisterAlumniData = await request.json()

    if (!data.name || !data.email || !data.batch) {
      return NextResponse.json({ error: 'Nama, email, dan angkatan wajib diisi' }, { status: 400 })
    }

    // Check if email exists in users collection
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: data.email.toLowerCase(),
        },
      },
    })

    const existingAlumni = await payload.find({
      collection: 'alumni',
      where: {
        email: {
          equals: data.email.toLowerCase(),
        },
      },
    })

    // ✅ Scenario 1: User sudah ada DAN sudah punya password
    if (existingUser.docs.length > 0 && existingUser.docs[0].hasPassword) {
      return NextResponse.json(
        { error: 'Email sudah digunakan dan memiliki akun aktif' },
        { status: 400 },
      )
    }

    // ✅ Scenario 2: Alumni sudah ada (dari import Google Forms) tapi user belum set password
    if (existingAlumni.docs.length > 0) {
      const alumni = existingAlumni.docs[0]

      // Jika user belum ada sama sekali, atau user ada tapi belum set password
      if (existingUser.docs.length === 0 || !existingUser.docs[0].hasPassword) {
        if (data.password) {
          // Update user dengan password baru atau create user baru
          if (existingUser.docs.length > 0) {
            // Update existing user with password
            await payload.update({
              collection: 'users',
              id: existingUser.docs[0].id,
              data: {
                password: data.password,
                hasPassword: true,
                name: data.name, // Update name juga
              },
            })
          } else {
            // Create new user with password
            await payload.create({
              collection: 'users',
              data: {
                email: data.email.toLowerCase(),
                password: data.password,
                name: data.name,
                roles: ['alumni'],
                alumniId: alumni.id,
                hasPassword: true,
              },
            })
          }

          return NextResponse.json(
            {
              message: 'Password berhasil dibuat! Anda dapat login sekarang.',
              alumni: alumni,
            },
            { status: 200 },
          )
        } else {
          // Tidak ada password diberikan, minta user untuk set password
          return NextResponse.json(
            {
              error: 'Email sudah terdaftar. Silakan buat password untuk login.',
              requirePassword: true,
              email: data.email.toLowerCase(),
            },
            { status: 400 },
          )
        }
      }
    }

    // ✅ Scenario 3: Email belum ada sama sekali - registrasi baru
    // Create new alumni
    const { password, ...alumniData } = data
    const alumni = await payload.create({
      collection: 'alumni',
      data: {
        ...alumniData,
        email: data.email.toLowerCase(),
        isPublic: data.isPublic !== false, // default true
        source: 'manual' as SourceType,
      },
    })

    // Create user with password if password is provided
    if (data.password) {
      await payload.create({
        collection: 'users',
        data: {
          email: data.email.toLowerCase(),
          password: data.password,
          name: data.name,
          roles: ['alumni'],
          alumniId: alumni.id,
          hasPassword: true,
        },
      })
    }

    return NextResponse.json(
      {
        message: 'Data alumni berhasil didaftarkan!',
        alumni: alumni,
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error('Error creating alumni:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
