import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })

    try {
      const { user } = await payload.auth({
        headers: request.headers,
      })

      if (!user) {
        return NextResponse.json(
          {
            authenticated: false,
            error: 'User tidak ditemukan atau token tidak valid',
          },
          { status: 401 },
        )
      }

      // ✅ OPTIMASI: Hanya kembalikan data yang ada di JWT
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
          hasPassword: user.hasPassword,
          // ✅ alumniId sudah berisi full data karena saveToJWT: true
          //   alumni: user.alumniId, // Data alumni lengkap dari JWT
        },
      })
    } catch (authError) {
      return NextResponse.json(
        {
          authenticated: false,
          error: 'Token tidak valid atau telah expired',
        },
        { status: 401 },
      )
    }
  } catch (error: unknown) {
    console.error('Error in /api/auth/me:', error)
    return NextResponse.json(
      {
        authenticated: false,
        error: 'Terjadi kesalahan server',
      },
      { status: 500 },
    )
  }
}
