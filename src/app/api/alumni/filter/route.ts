import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import type { Where } from 'payload'

async function isAuthenticatedAdmin(request: NextRequest): Promise<boolean> {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const payloadToken = request.cookies.get('payload-token')?.value

    if (!payloadToken) {
      return false
    }

    const user = await payload.auth({ headers: request.headers })

    if (!user?.user) {
      return false
    }

    const isAdmin = user.user.roles?.includes('admin') || user.user.collection === 'users'
    return isAdmin
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const isAdmin = await isAuthenticatedAdmin(request)

    console.log(`🔐 User authenticated as admin: ${isAdmin}`)

    const batch = searchParams.get('batch')
    const city = searchParams.get('city')
    const workField = searchParams.get('workField')
    const currentEmployer = searchParams.get('currentEmployer')
    const position = searchParams.get('position')
    const search = searchParams.get('search')
    const sortParam = searchParams.get('sort') || '-batch'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    const sort = sortParam.startsWith('-') ? sortParam : `-${sortParam}`

    const where: Where = {
      and: [
        {
          'metadata.isPublic': {
            equals: true,
          },
        },
      ],
    }

    if (batch) {
      where.and!.push({
        batch: {
          equals: parseInt(batch),
        },
      })
    }

    if (city && isAdmin) {
      where.and!.push({
        'kontak.location.city': {
          equals: city,
        },
      })
    }

    if (workField && isAdmin) {
      where.and!.push({
        'pekerjaan.workField': {
          contains: workField,
        },
      })
    }

    if (currentEmployer && isAdmin) {
      where.and!.push({
        'pekerjaan.currentEmployer': {
          contains: currentEmployer,
        },
      })
    }

    if (position && isAdmin) {
      where.and!.push({
        'pekerjaan.position': {
          contains: position,
        },
      })
    }

    if (search && isAdmin) {
      const searchTerm = search.trim()
      if (searchTerm) {
        where.and!.push({
          or: [
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
          ],
        })
      }
    }

    console.log('🔍 Filter where clause:', JSON.stringify(where, null, 2))

    const result = await payload.find({
      collection: 'alumni',
      where,
      sort,
      limit,
      page,
      depth: 2,
    })

    console.log(`📊 Found ${result.docs.length} alumni out of ${result.totalDocs}`)

    // ✅ FIX: Return different data structure based on authentication
    const filteredDocs = result.docs.map((alumni) => {
      if (!isAdmin) {
        // ❌ Non-authenticated: Return limited data
        return {
          id: alumni.id,
          name: alumni.name,
          batch: alumni.batch,
          metadata: {
            isPublic: alumni.metadata?.isPublic ?? true,
            photo: alumni.metadata?.photo || null,
          },
        }
      }
      // ✅ Authenticated: Return FULL alumni object
      return alumni
    })

    console.log('📤 Returning data:', {
      isAdmin,
      docsCount: filteredDocs.length,
      firstDocKeys: filteredDocs[0] ? Object.keys(filteredDocs[0]) : [],
    })

    return NextResponse.json({
      success: true,
      alumni: filteredDocs,
      total: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      isAuthenticated: isAdmin,
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
