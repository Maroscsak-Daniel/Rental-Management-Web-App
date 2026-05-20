import { NextResponse, type NextRequest } from 'next/server'
import { createProxyClient } from './lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  const { supabase, response } = createProxyClient(request)

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublicRoute =
    path === '/login' ||
    path === '/register' ||
    path.startsWith('/auth/callback') ||
    path === '/forgot-password' ||
    path === '/reset-password'

  const isLandlordRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/buildings') ||
    path.startsWith('/units') ||
    path.startsWith('/maintenance')

  const isTenantRoute = path.startsWith('/tenant')

  const isProtectedRoute = isLandlordRoute || isTenantRoute

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (path === '/login' || path === '/register')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const destination =
      profile?.role === 'tenant' ? '/tenant/maintenance' : '/dashboard'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  if (user && isLandlordRoute) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Proxy profile fetch error:', error)
    }

    if (profile?.role !== 'landlord') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  if (user && isTenantRoute) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Proxy profile fetch error:', error)
    }

    if (profile?.role !== 'tenant') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - api (API routes, optional if you have them)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
