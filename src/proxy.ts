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
  const isPublicRoute = path === '/login' || path === '/register'
  const isForgotPasswordRoute = path === '/forgot-password'
  const isResetPasswordRoute = path === '/reset-password'
  const isSetPasswordRoute = path === '/set-password'
  const isAuthCallback = path.startsWith('/auth/')

  // Auth callback must always proceed — it exchanges tokens for sessions
  // (e.g., tenant invite links must work even if a landlord is logged in)
  if (isAuthCallback) {
    return response
  }

  // Legacy /portal → redirect to /tenant/portal
  if (path === '/portal') {
    return NextResponse.redirect(new URL('/tenant/portal', request.url))
  }

  // Routes restricted to landlords only
  const isLandlordRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/buildings') ||
    path.startsWith('/units') ||
    path.startsWith('/tenants') ||
    path.startsWith('/leases') ||
    path.startsWith('/invoices') ||
    path.startsWith('/maintenance') ||
    path.startsWith('/payments') ||
    path.startsWith('/documents') ||
    path.startsWith('/notifications')

  // Routes restricted to tenants only
  const isTenantRoute = path.startsWith('/tenant/')

  // --- Unauthenticated users ---
  if (!user) {
    if (isLandlordRoute || isTenantRoute || isSetPasswordRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Allow public routes, forgot-password, reset-password, etc.
    return response
  }

  // --- Authenticated users: fetch role once ---
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Proxy profile fetch error:', profileError)
  }

  const role = profile?.role

  // Redirect logged-in users away from public routes
  if (isPublicRoute || isForgotPasswordRoute || isResetPasswordRoute) {
    if (role === 'tenant') {
      return NextResponse.redirect(new URL('/tenant/portal', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Guard landlord routes — tenants cannot access
  if (isLandlordRoute) {
    if (role !== 'landlord') {
      return NextResponse.redirect(new URL('/tenant/portal', request.url))
    }
  }

  // Guard tenant routes — landlords cannot access
  if (isTenantRoute) {
    if (role !== 'tenant') {
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
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/).*)',
  ],
}
