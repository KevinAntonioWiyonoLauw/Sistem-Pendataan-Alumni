import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'Metabase integration is temporarily disabled' },
    { status: 503 },
  )
}
