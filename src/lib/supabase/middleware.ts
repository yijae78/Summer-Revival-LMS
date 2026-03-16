import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

// Exact public paths (no prefix matching)
const PUBLIC_PATHS = ['/', '/login', '/pin', '/setup', '/start', '/auth/callback', '/join', '/design-preview']

// Public path prefixes (startsWith matching)
const PUBLIC_PREFIXES = ['/join/', '/api/auth/']

// API routes that require authentication
const PROTECTED_API = ['/api/chat']

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true
  return false
}

function isProtectedApi(pathname: string): boolean {
  return PROTECTED_API.some((api) => pathname === api || pathname.startsWith(api + '/'))
}

function getSupabaseCredentials(request: NextRequest): { url: string; anonKey: string } | null {
  // Priority 1: Environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey }
  }

  // Priority 2: Cookies (BYOS mode)
  const cookieUrl = request.cookies.get('sb-url')?.value
  const cookieKey = request.cookies.get('sb-anon-key')?.value

  if (cookieUrl && cookieKey) {
    return { url: cookieUrl, anonKey: cookieKey }
  }

  return null
}

function buildCookieHeader(request: NextRequest): string {
  return request.cookies
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')
}

function isDemoModeEnabled(request: NextRequest): boolean {
  return request.cookies.get('demo-mode')?.value === 'true'
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Allow static files
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Allow non-protected API routes (e.g. /api/auth/*)
  if (pathname.startsWith('/api') && !isProtectedApi(pathname)) {
    return NextResponse.next()
  }

  // --- Demo mode: allow all dashboard routes without authentication ---
  if (isDemoModeEnabled(request)) {
    // In demo mode, allow access to all dashboard routes
    // But block protected APIs (chat requires real credentials)
    if (isProtectedApi(pathname)) {
      return NextResponse.json(
        { error: 'AI 챗봇은 데모 모드에서 사용할 수 없어요.' },
        { status: 403 }
      )
    }
    return NextResponse.next()
  }

  // --- Authentication required beyond this point ---

  const credentials = getSupabaseCredentials(request)

  // If Supabase is not configured, redirect to setup (or 401 for API)
  if (!credentials) {
    if (isProtectedApi(pathname)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const setupUrl = new URL('/setup', request.url)
    return NextResponse.redirect(setupUrl)
  }

  // Create a Supabase client with the request cookies forwarded
  const supabase = createClient(credentials.url, credentials.anonKey, {
    global: {
      headers: {
        cookie: buildCookieHeader(request),
      },
    },
  })

  // Verify the session by calling getUser() (server-side token validation)
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    // Protected API routes get 401 JSON
    if (isProtectedApi(pathname)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Dashboard/protected pages get redirected to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
