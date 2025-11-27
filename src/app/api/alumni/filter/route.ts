import { NextRequest, NextResponse } from 'next/server'

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'
const STRAPI_API_KEY = process.env.STRAPI_API_KEY

interface StrapiFilters {
  batch?: { $eq: number }
  name?: { $containsi: string }
  kontak?: {
    location?: {
      city?: { $containsi: string }
    }
  }
  pekerjaan?: {
    workField?: { $containsi: string }
    currentEmployer?: { $containsi: string }
    position?: { $containsi: string }
  }
  metadata?: {
    isPublic?: { $eq: boolean }
  }
}

interface StrapiAlumniItem {
  documentId?: string
  id: string
  name?: string
  batch?: number
  kontak?: {
    email?: string
    phone?: string
    linkedin?: string
    location?: {
      city?: string
      country?: string
    }
  }
  pekerjaan?: {
    currentEmployer?: string
    workField?: string
    position?: string
  }
  jejaring?: {
    contactPersonReady?: string
    alumniOfficerReady?: string
    otherContacts?: string
  }
  kontribusi?: {
    willingToHelp?: string
    helpTopics?: string
  }
  lainnya?: {
    suggestions?: string
  }
  createdAt: string
  updatedAt: string
}

interface StrapiResponse {
  data: StrapiAlumniItem[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

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
    const pageSize = parseInt(searchParams.get('pageSize') || '12')

    const sortField = searchParams.get('sortField') || 'batch'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const filters: StrapiFilters = {
      metadata: {
        isPublic: { $eq: true },
      },
    }

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
        workField: { $containsi: workField },
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

    function normalizeCapitalization(text: string | undefined): string {
      if (!text) return ''

      // Capitalize first letter of each word
      return text
        .split(',')
        .map((item) => item.trim())
        .map((item) =>
          item
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' '),
        )
        .join(', ')
    }

    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'pagination[withCount]': 'true',
      'populate[kontak][populate][location]': 'true',
      'populate[pekerjaan]': 'true',
      'populate[jejaring]': 'true',
      'populate[kontribusi]': 'true',
      'populate[lainnya]': 'true',
      'populate[metadata]': 'true',
    })

    params.append('sort[0]', `${sortField}:${sortOrder}`)
    params.append('filters[metadata][isPublic][$eq]', 'true')
    params.append('sort[1]', 'name:asc')

    if (filters.batch) {
      params.append('filters[batch][$eq]', filters.batch.$eq.toString())
    }

    if (filters.name) {
      params.append('filters[name][$containsi]', filters.name.$containsi)
    }

    if (filters.kontak?.location?.city) {
      params.append(
        'filters[kontak][location][city][$containsi]',
        filters.kontak.location.city.$containsi,
      )
    }

    if (filters.pekerjaan?.workField) {
      params.append(
        'filters[pekerjaan][workField][$containsi]',
        filters.pekerjaan.workField.$containsi,
      )
    }

    if (filters.pekerjaan?.currentEmployer) {
      params.append(
        'filters[pekerjaan][currentEmployer][$containsi]',
        filters.pekerjaan.currentEmployer.$containsi,
      )
    }

    if (filters.pekerjaan?.position) {
      params.append(
        'filters[pekerjaan][position][$containsi]',
        filters.pekerjaan.position.$containsi,
      )
    }

    const url = `${STRAPI_URL}/api/alumnis?${params}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_API_KEY}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Strapi error:', errorText)
      throw new Error(`Strapi API error: ${response.status}`)
    }

    const data: StrapiResponse = await response.json()

    const alumni = data.data.map((item: StrapiAlumniItem) => ({
      id: item.documentId || item.id,
      name: item.name || '',
      batch: item.batch || 0,
      kontak: {
        email: item.kontak?.email || '',
        phone: item.kontak?.phone || '',
        linkedin: item.kontak?.linkedin || '',
        location: {
          city: item.kontak?.location?.city || '',
          country: item.kontak?.location?.country || 'Indonesia',
        },
      },
      pekerjaan: {
        currentEmployer: normalizeCapitalization(item.pekerjaan?.currentEmployer) || '',
        workField: normalizeCapitalization(item.pekerjaan?.workField) || '',
        position: normalizeCapitalization(item.pekerjaan?.position) || '',
      },
      jejaring: {
        contactPersonReady: item.jejaring?.contactPersonReady || 'tidak',
        alumniOfficerReady: item.jejaring?.alumniOfficerReady || 'tidak',
        otherContacts: item.jejaring?.otherContacts || '',
      },
      kontribusi: {
        willingToHelp: item.kontribusi?.willingToHelp || '',
        helpTopics: item.kontribusi?.helpTopics || '',
      },
      lainnya: {
        suggestions: item.lainnya?.suggestions || '',
      },
      metadata: {
        isPublic: true,
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))

    return NextResponse.json({
      alumni,
      pagination: {
        page: data.meta.pagination.page,
        pageSize: data.meta.pagination.pageSize,
        pageCount: data.meta.pagination.pageCount,
        total: data.meta.pagination.total,
      },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('❌ Error fetching alumni:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alumni data', details: errorMessage },
      { status: 500 },
    )
  }
}
