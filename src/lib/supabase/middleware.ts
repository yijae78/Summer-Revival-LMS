import { type NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/pin', '/join', '/setup', '/auth/callback']

export function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Allow API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Allow static files
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check for Supabase auth token in cookies
  const hasAuthToken = request.cookies.getAll().some((cookie) =>
    cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
  )

  if (!hasAuthToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
