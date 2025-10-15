import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

interface LogoutResponse {
  success: boolean
  message: string
}

export async function POST(): Promise<NextResponse<LogoutResponse>> {
  try {
    // Untuk logout, cukup beri response success
    // Client-side akan menghapus token dari storage
    const response = NextResponse.json({
      success: true,
      message: 'Logout berhasil',
    })

    // Hapus cookies jika ada
    response.cookies.delete('payload-token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat logout',
      },
      { status: 500 },
    )
  }
}
