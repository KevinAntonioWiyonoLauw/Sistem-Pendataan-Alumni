import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })

    // ✅ Sesuai dokumentasi: menggunakan req.user yang otomatis ada
    const { user } = await payload.auth({
      headers: request.headers,
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 401 })
    }

    // ✅ Data sudah tersedia di JWT: user.roles, user.alumniId, user.name, user.hasPassword
    console.log('User from JWT:', {
      id: user.id,
      email: user.email,
      name: user.name, // ✅ Tersedia karena saveToJWT: true
      roles: user.roles, // ✅ Tersedia karena saveToJWT: true
      alumniId: user.alumniId, // ✅ Tersedia karena saveToJWT: true
      hasPassword: user.hasPassword, // ✅ Tersedia karena saveToJWT: true
    })

    if (!user.alumniId) {
      return NextResponse.json(
        { error: 'User tidak memiliki data alumni terkait' },
        { status: 400 },
      )
    }

    // ✅ Perbaikan: Handle alumni ID yang bisa berupa object atau string
    const alumniId = typeof user.alumniId === 'object' ? user.alumniId.id : user.alumniId

    // Get full alumni data with relationships
    const alumni = await payload.findByID({
      collection: 'alumni',
      id: alumniId,
      depth: 2,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        hasPassword: user.hasPassword,
      },
      alumni: alumni,
    })
  } catch (error: unknown) {
    console.error('Error getting profile:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
