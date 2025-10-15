import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is accessing protected routes
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ['/alumni/dashboard', '/alumni/profile', '/alumni/settings']

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Check for authentication token in cookies
    const token = request.cookies.get('payload-token')

    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/alumni/dashboard/:path*', '/alumni/profile/:path*', '/alumni/settings/:path*'],
}
