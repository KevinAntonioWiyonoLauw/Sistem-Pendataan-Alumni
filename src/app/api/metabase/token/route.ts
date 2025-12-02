import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const METABASE_SECRET_KEY = process.env.METABASE_KEY

export async function GET() {
  try {
    if (!METABASE_SECRET_KEY) {
      return NextResponse.json({ error: 'Metabase secret key not configured' }, { status: 500 })
    }

    const payload = {
      resource: { dashboard: 3 }, // Dashboard ID 3
      params: {},
      exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minute expiration
    }

    const token = jwt.sign(payload, METABASE_SECRET_KEY)

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error generating Metabase token:', error)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
