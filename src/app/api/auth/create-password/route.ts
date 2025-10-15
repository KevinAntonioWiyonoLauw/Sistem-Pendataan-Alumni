import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

interface CreatePasswordRequest {
  email: string
  password: string
}

interface CreatePasswordResponse {
  success: boolean
  message: string
  userId?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const { email, password }: CreatePasswordRequest = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email.toLowerCase(),
        },
      },
    })

    if (existingUser.docs.length > 0) {
      const user = existingUser.docs[0]

      if (user.hasPassword) {
        return NextResponse.json({ error: 'Email sudah memiliki password' }, { status: 400 })
      }

      // Update user with password
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          password,
          hasPassword: true,
        },
      })

      return NextResponse.json({
        message: 'Password berhasil dibuat',
        success: true,
      })
    } else {
      // Find alumni data first
      const alumniData = await payload.find({
        collection: 'alumni',
        where: {
          email: {
            equals: email.toLowerCase(),
          },
        },
      })

      if (alumniData.docs.length === 0) {
        return NextResponse.json(
          { error: 'Email tidak ditemukan dalam data alumni' },
          { status: 404 },
        )
      }

      // Create new user
      const newUser = await payload.create({
        collection: 'users',
        data: {
          email: email.toLowerCase(),
          password,
          name: alumniData.docs[0].name,
          alumniId: alumniData.docs[0].id,
          hasPassword: true,
        },
      })

      return NextResponse.json({
        message: 'User dan password berhasil dibuat',
        success: true,
        userId: newUser.id,
      })
    }
  } catch (error: unknown) {
    console.error('Error creating password:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
