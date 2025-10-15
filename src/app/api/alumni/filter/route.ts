import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import type { Where } from 'payload'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const batch = searchParams.get('batch')
    const city = searchParams.get('city')
    const country = searchParams.get('country')
    const currentStatus = searchParams.get('currentStatus')
    const institution = searchParams.get('institution') // ✅ Sudah ada
    const position = searchParams.get('position') // ✅ Tambah filter position
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')
    const page = parseInt(searchParams.get('page') || '1')
    const sort = searchParams.get('sort') || '-batch'

    // Build where clause
    const where = {
      isPublic: {
        equals: true,
      },
    } as Where

    if (batch) {
      where.batch = {
        equals: parseInt(batch),
      }
    }

    if (currentStatus) {
      where.currentStatus = {
        equals: currentStatus,
      }
    }

    if (city) {
      where['location.city'] = {
        contains: city,
      }
    }

    if (country) {
      where['location.country'] = {
        contains: country,
      }
    }

    // ✅ Filter berdasarkan institusi/perusahaan
    if (institution) {
      where.institution = {
        contains: institution,
      }
    }

    // ✅ TAMBAHAN: Filter berdasarkan posisi/jabatan
    if (position) {
      where.position = {
        contains: position,
      }
    }

    // ✅ Handle search across multiple fields
    if (search) {
      where.or = [
        {
          name: {
            contains: search,
          },
        },
        {
          email: {
            contains: search,
          },
        },
        {
          institution: {
            contains: search,
          },
        },
        {
          position: {
            contains: search,
          },
        },
      ]
    }

    console.log('🔍 Filter where clause:', JSON.stringify(where, null, 2))

    const result = await payload.find({
      collection: 'alumni',
      where,
      sort,
      limit,
      page,
      depth: 1,
    })

    console.log(`📊 Found ${result.docs.length} alumni out of ${result.totalDocs}`)

    return NextResponse.json({
      success: true,
      alumni: result.docs,
      total: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    })
  } catch (error: unknown) {
    console.error('Error filtering alumni:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
