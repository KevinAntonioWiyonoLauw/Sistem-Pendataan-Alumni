import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    name: string | null
  }
  alumni?: {
    id: string
    name: string
    batch: number
    currentStatus: string | null
  } | null
  token?: string
  error?: string
  requirePasswordCreation?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { email, password }: LoginRequest = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 })
    }

    const payload = await getPayloadHMR({ config: configPromise })

    // Login menggunakan Users collection (default auth)
    try {
      const result = await payload.login({
        collection: 'users',
        data: {
          email: email.toLowerCase(),
          password,
        },
        req: request,
      })

      // Cari data alumni berdasarkan email user
      const alumniResult = await payload.find({
        collection: 'alumni',
        where: {
          email: {
            equals: email.toLowerCase(),
          },
        },
        limit: 1,
      })

      let alumniData = null
      if (alumniResult.docs.length > 0) {
        alumniData = alumniResult.docs[0]
      }

      // ✅ PERBAIKAN: Manual set HTTP-only cookie
      const response = NextResponse.json({
        success: true,
        message: 'Login berhasil',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name || alumniData?.name,
        },
        alumni: alumniData
          ? {
              id: alumniData.id,
              name: alumniData.name,
              batch: alumniData.batch,
              currentStatus: alumniData.currentStatus,
            }
          : null,
        // ✅ Tidak perlu kirim token di body jika pakai HTTP-only cookie
        // token: result.token,
      })

      // ✅ Set HTTP-only cookie dengan token
      if (result.token) {
        response.cookies.set('payload-token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 days (sesuai config di Users.ts)
          path: '/',
        })
      }

      return response
    } catch (authError: unknown) {
      const error = authError as Error

      if (error.message?.includes('Invalid login')) {
        return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
      }

      if (error.message?.includes('locked')) {
        return NextResponse.json(
          { error: 'Akun terkunci karena terlalu banyak percobaan login yang gagal' },
          { status: 423 },
        )
      }

      // Cek apakah alumni ada tapi belum punya akun user
      const alumniResult = await payload.find({
        collection: 'alumni',
        where: {
          email: {
            equals: email.toLowerCase(),
          },
        },
        limit: 1,
      })

      if (alumniResult.docs.length > 0) {
        return NextResponse.json(
          {
            error: 'Alumni sudah terdaftar tapi belum memiliki akun login',
            requirePasswordCreation: true,
            email: email,
          },
          { status: 401 },
        )
      }

      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
