import { NextResponse } from 'next/server'
import { getCachedData, setCachedData } from '@/lib/redis'

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'
const STRAPI_API_KEY = process.env.STRAPI_API_KEY

interface StrapiAlumniItem {
  documentId?: string
  id: string
  name?: string
  batch?: number
  pekerjaan?: {
    workField?: string
  }
  metadata?: {
    isPublic?: boolean
  }
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

interface BatchStats {
  batch: number
  count: number
}

interface WorkFieldStats {
  field: string
  count: number
}

interface StatsResponse {
  totalAlumni: number
  usersPerBatch: BatchStats[]
  usersPerWorkField: WorkFieldStats[]
  cachedAt: string
  source: 'cache' | 'api'
}

const CACHE_KEY = 'alumni:stats'
const CACHE_TTL = 1800

async function fetchAllAlumniFromStrapi(): Promise<StrapiAlumniItem[]> {
  const allAlumni: StrapiAlumniItem[] = []
  let page = 1
  const pageSize = 100
  let hasMore = true

  while (hasMore) {
    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'pagination[withCount]': 'true',
      'populate[pekerjaan]': 'true',
      'populate[metadata]': 'true',
      'filters[metadata][isPublic][$eq]': 'true',
      'sort[0]': 'batch:desc',
    })

    const url = `${STRAPI_URL}/api/alumnis?${params}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_API_KEY}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Strapi error:', errorText)
      throw new Error(`Strapi API error: ${response.status}`)
    }

    const data: StrapiResponse = await response.json()
    allAlumni.push(...data.data)

    if (page >= data.meta.pagination.pageCount) {
      hasMore = false
    } else {
      page++
    }
  }

  return allAlumni
}

function computeStats(alumni: StrapiAlumniItem[]): StatsResponse {
  const publicAlumni = alumni.filter((item) => item.metadata?.isPublic !== false)

  const batchMap = new Map<number, number>()
  for (const item of publicAlumni) {
    const batch = item.batch || 0
    if (batch > 0) {
      batchMap.set(batch, (batchMap.get(batch) || 0) + 1)
    }
  }

  const usersPerBatch: BatchStats[] = Array.from(batchMap.entries())
    .map(([batch, count]) => ({ batch, count }))
    .sort((a, b) => a.batch - b.batch)

  const fieldMap = new Map<string, number>()
  for (const item of publicAlumni) {
    const field = item.pekerjaan?.workField?.trim()
    if (field) {
      fieldMap.set(field, (fieldMap.get(field) || 0) + 1)
    } else {
      fieldMap.set('Belum diisi', (fieldMap.get('Belum diisi') || 0) + 1)
    }
  }

  const usersPerWorkField: WorkFieldStats[] = Array.from(fieldMap.entries())
    .map(([field, count]) => ({ field, count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalAlumni: publicAlumni.length,
    usersPerBatch,
    usersPerWorkField,
    cachedAt: new Date().toISOString(),
    source: 'api',
  }
}

export async function GET() {
  try {
    const cached = await getCachedData<StatsResponse>(CACHE_KEY)
    if (cached) {
      return NextResponse.json({
        ...cached,
        source: 'cache',
      })
    }

    const alumni = await fetchAllAlumniFromStrapi()
    const stats = computeStats(alumni)

    await setCachedData(CACHE_KEY, stats, CACHE_TTL)

    return NextResponse.json(stats)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error fetching alumni stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alumni statistics', details: errorMessage },
      { status: 500 },
    )
  }
}
