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
    const workField = searchParams.get('workField')
    const currentEmployer = searchParams.get('currentEmployer')
    const position = searchParams.get('position')
    const search = searchParams.get('search')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const sort = searchParams.get('sort') || '-batch'

    // ✅ Build where clause untuk struktur baru
    const where = {
      'metadata.isPublic': {
        equals: true,
      },
    } as Where

    if (batch && !isNaN(parseInt(batch))) {
      where.batch = {
        equals: parseInt(batch),
      }
    }

    if (city && city.trim()) {
      where['kontak.location.city'] = {
        contains: city.trim(),
      }
    }

    if (workField && workField.trim()) {
      where['pekerjaan.workField'] = {
        contains: workField.trim(),
      }
    }

    if (currentEmployer && currentEmployer.trim()) {
      where['pekerjaan.currentEmployer'] = {
        contains: currentEmployer.trim(),
      }
    }

    if (position && position.trim()) {
      where['pekerjaan.position'] = {
        contains: position.trim(),
      }
    }

    if (search && search.trim()) {
      const searchTerm = search.trim()
      where.or = [
        {
          name: {
            contains: searchTerm,
          },
        },
        {
          'kontak.email': {
            contains: searchTerm,
          },
        },
        {
          'pekerjaan.currentEmployer': {
            contains: searchTerm,
          },
        },
        {
          'pekerjaan.position': {
            contains: searchTerm,
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
      depth: 2, // ✅ Increase depth untuk nested data
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
    console.error('❌ Error filtering alumni:', error)

    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server'
    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
      },
      { status: 500 },
    )
  }
}
