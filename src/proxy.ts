import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of custom admin routes that need protection
const PROTECTED_ADMIN_ROUTES = [
  '/admin/import',
  // Add more custom admin routes here
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Only check our specific protected admin routes
  const isProtectedRoute = PROTECTED_ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  )

  if (isProtectedRoute) {
    const payloadToken = request.cookies.get('payload-token')

    if (!payloadToken) {
      console.log(`No token found, redirecting from ${pathname} to /admin`)
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    try {
      const tokenValue = payloadToken.value
      const parts = tokenValue.split('.')

      if (parts.length !== 3) {
        throw new Error('Invalid JWT format')
      }

      const [, payloadPart] = parts
      const decodedPayload = JSON.parse(Buffer.from(payloadPart, 'base64').toString('utf-8'))

      // Check expiration
      const now = Math.floor(Date.now() / 1000)
      if (decodedPayload.exp && decodedPayload.exp < now) {
        console.log('Token expired, redirecting to /admin')
        const response = NextResponse.redirect(new URL('/admin', request.url))
        response.cookies.delete('payload-token')
        return response
      }

      // Check admin role
      if (!decodedPayload.roles || !decodedPayload.roles.includes('admin')) {
        console.log('User is not admin:', decodedPayload.roles)
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      console.log(`Admin access granted for ${decodedPayload.email} to ${pathname}`)
      return NextResponse.next()
    } catch (error) {
      console.error('Token validation error:', error)
      const response = NextResponse.redirect(new URL('/admin', request.url))
      response.cookies.delete('payload-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/import/:path*'],
}
