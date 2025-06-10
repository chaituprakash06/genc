import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect /disputes routes
  if (req.nextUrl.pathname.startsWith('/disputes')) {
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if (req.nextUrl.pathname.startsWith('/auth/')) {
    if (session && !req.nextUrl.pathname.includes('/auth/callback')) {
      return NextResponse.redirect(new URL('/disputes', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/disputes/:path*',
    '/auth/:path*',
    '/api/disputes/:path*',
    '/api/analyze/:path*',
    '/api/dispute-chat/:path*'
  ]
}