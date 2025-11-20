import { NextRequest, NextResponse } from 'next/server'

// Middleware tidak diperlukan untuk Strapi karena admin panel di-handle oleh Strapi sendiri
// Redirect ke Strapi admin jika user mengakses /admin
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect /admin ke Strapi admin panel
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const strapiAdminUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'
    return NextResponse.redirect(`${strapiAdminUrl}/admin`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
