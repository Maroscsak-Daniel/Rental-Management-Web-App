import { NextResponse, type NextRequest } from 'next/server'
import { createProxyClient } from './lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  const { supabase, response } = createProxyClient(request)

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Auth callback routes must always proceed — they exchange tokens for sessions
  if (path.startsWith('/auth/')) {
    return response
  }

  const isPublicRoute =
    path === '/login' ||
    path === '/register' ||
    path === '/forgot-password' ||
    path === '/reset-password'

  const isSetPasswordRoute = path === '/set-password'

  const isLandlordRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/buildings') ||
    path.startsWith('/units') ||
    path.startsWith('/tenants') ||
    path.startsWith('/leases') ||
    path.startsWith('/invoices') ||
    path.startsWith('/payments') ||
    path.startsWith('/maintenance')

  // Use /tenant/ (with trailing slash) so /tenants doesn't match
  const isTenantRoute = path.startsWith('/tenant/')

  const isProtectedRoute = isLandlordRoute || isTenantRoute || isSetPasswordRoute

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isPublicRoute) {
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
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
