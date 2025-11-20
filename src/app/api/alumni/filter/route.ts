import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const batch = searchParams.get('batch')
    const city = searchParams.get('city')
    const workField = searchParams.get('workField')
    const currentEmployer = searchParams.get('currentEmployer')
    const position = searchParams.get('position')
    const search = searchParams.get('search')
    const sortParam = searchParams.get('sort') || 'batch:desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build Strapi filters
    const filters: any = {
      isPublic: {
        $eq: true,
      },
    }

    if (batch) {
      filters.batch = {
        $eq: parseInt(batch),
      }
    }

    if (city) {
      filters.city = {
        $containsi: city,
      }
    }

    if (workField) {
      filters.workField = {
        $containsi: workField,
      }
    }

    if (currentEmployer) {
      filters.currentEmployer = {
        $containsi: currentEmployer,
      }
    }

    if (position) {
      filters.position = {
        $containsi: position,
      }
    }

    if (search) {
      filters.$or = [
        { name: { $containsi: search } },
        { currentEmployer: { $containsi: search } },
        { position: { $containsi: search } },
      ]
    }

    // Query Strapi
    const response = await axios.get(`${STRAPI_URL}/api/alumni`, {
      params: {
        filters,
        sort: sortParam,
        pagination: {
          page,
          pageSize: limit,
        },
        populate: '*',
      },
    })

    const alumni = response.data.data.map((item: any) => ({
      id: item.id,
      ...item.attributes,
    }))

    return NextResponse.json({
      alumni,
      totalDocs: response.data.meta.pagination.total,
      page: response.data.meta.pagination.page,
      totalPages: response.data.meta.pagination.pageCount,
      isAuthenticated: false,
    })
  } catch (error: any) {
    console.error('Error fetching alumni:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch alumni data', details: error.message },
      { status: 500 },
    )
  }
}
