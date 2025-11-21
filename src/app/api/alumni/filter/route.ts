import { NextRequest, NextResponse } from 'next/server'

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'
const STRAPI_API_KEY = process.env.STRAPI_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const batch = searchParams.get('batch')
    const city = searchParams.get('city')
    const workField = searchParams.get('workField')
    const currentEmployer = searchParams.get('currentEmployer')
    const position = searchParams.get('position')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build Strapi filters
    const filters: any = {}

    if (batch) {
      filters.batch = { $eq: parseInt(batch) }
    }

    if (search) {
      filters.name = { $containsi: search }
    }

    if (city) {
      filters.kontak = {
        location: {
          city: { $containsi: city },
        },
      }
    }

    if (workField) {
      filters.pekerjaan = {
        workField: { $eq: workField },
      }
    }

    if (currentEmployer) {
      filters.pekerjaan = {
        ...filters.pekerjaan,
        currentEmployer: { $containsi: currentEmployer },
      }
    }

    if (position) {
      filters.pekerjaan = {
        ...filters.pekerjaan,
        position: { $containsi: position },
      }
    }

    // Build URL params
    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': limit.toString(),
      'populate[kontak][populate][location]': 'true',
      'populate[pekerjaan]': 'true',
      'populate[jejaring]': 'true',
      'populate[kontribusi]': 'true',
      'populate[lainnya]': 'true',
      'sort[0]': 'batch:desc',
      'sort[1]': 'name:asc',
    })

    // Add filters if exist
    if (Object.keys(filters).length > 0) {
      params.append('filters', JSON.stringify(filters))
    }

    const url = `${STRAPI_URL}/api/alumnis?${params}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Strapi error:', errorText)
      throw new Error(`Strapi API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform Strapi data to Alumni format
    const alumni = data.data.map((item: any) => ({
      id: item.documentId || item.id,
      name: item.name || '',
      batch: item.batch || 0,
      nim: item.nim || '',
      email: item.kontak?.email || '',
      phone: item.kontak?.phone || '',
      linkedin: item.kontak?.linkedin || '',
      city: item.kontak?.location?.city || '',
      country: item.kontak?.location?.country || 'Indonesia',
      currentEmployer: item.pekerjaan?.currentEmployer || '',
      workField: item.pekerjaan?.workField ? [item.pekerjaan.workField] : [],
      position: item.pekerjaan?.position || '',
      contactPersonReady: item.jejaring?.contactPersonReady === 'ya',
      alumniOfficerReady: item.jejaring?.alumniOfficerReady === 'ya',
      otherContacts: item.jejaring?.otherContacts || '',
      willingToHelp: item.kontribusi?.willingToHelp ? [item.kontribusi.willingToHelp] : [],
      helpTopics: item.kontribusi?.helpTopics || '',
      suggestions: item.lainnya?.suggestions || '',
      isPublic: true,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))

    return NextResponse.json({
      alumni,
      totalDocs: data.meta.pagination.total,
      page: data.meta.pagination.page,
      totalPages: data.meta.pagination.pageCount,
      isAuthenticated: false,
    })
  } catch (error: any) {
    console.error('❌ Error fetching alumni:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alumni data', details: error.message },
      { status: 500 },
    )
  }
}
