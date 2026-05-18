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
  const isPublicRoute = path === '/login' || path === '/register' || path.startsWith('/auth/callback')
  
  // Routes restricted to landlords only
  const isLandlordRoute = path.startsWith('/dashboard') || path.startsWith('/buildings') || path.startsWith('/units')

  if (!user && isLandlordRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (user && isLandlordRoute) {
    // Optimistic check: get user role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'landlord') {
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
