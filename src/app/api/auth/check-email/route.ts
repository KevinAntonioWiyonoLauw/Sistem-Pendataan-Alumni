import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email harus diisi' }, { status: 400 })
    }

    // Check if email exists in users collection
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email.toLowerCase(),
        },
      },
    })

    // Check if email exists in alumni collection
    const existingAlumni = await payload.find({
      collection: 'alumni',
      where: {
        email: {
          equals: email.toLowerCase(),
        },
      },
    })

    const isEmailUsed = existingUser.docs.length > 0
    const isInAlumni = existingAlumni.docs.length > 0
    const hasPassword = isEmailUsed ? existingUser.docs[0].hasPassword || false : false

    return NextResponse.json({
      isEmailUsed,
      isInAlumni,
      hasPassword,
      alumniData: isInAlumni ? existingAlumni.docs[0] : null,
    })
  } catch (error: unknown) {
    console.error('Error checking email:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
