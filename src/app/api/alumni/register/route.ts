import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const data = await request.json()

    // Validasi data dasar
    if (!data.name || !data.email || !data.nim || !data.batch) {
      return NextResponse.json(
        { error: 'Nama, email, NIM, dan angkatan wajib diisi' },
        { status: 400 },
      )
    }

    // Cek apakah NIM sudah ada
    const existingAlumni = await payload.find({
      collection: 'alumni',
      where: {
        nim: {
          equals: data.nim,
        },
      },
    })

    if (existingAlumni.docs.length > 0) {
      return NextResponse.json({ error: 'NIM sudah terdaftar' }, { status: 400 })
    }

    // Cek apakah email sudah ada
    const existingEmail = await payload.find({
      collection: 'alumni',
      where: {
        email: {
          equals: data.email,
        },
      },
    })

    if (existingEmail.docs.length > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    // Buat data alumni baru
    const alumni = await payload.create({
      collection: 'alumni',
      data: {
        ...data,
        isPublic: data.isPublic || true, // Default true
      },
    })

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
