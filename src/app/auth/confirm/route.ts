import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const { searchParams, origin } = url
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as
    | 'invite'
    | 'signup'
    | 'recovery'
    | 'email'
    | null
  const next = searchParams.get('next') ?? '/set-password'

  console.log('=== AUTH CONFIRM ===')
  console.log('Full URL:', url.toString())
  console.log('Params:', { token_hash: token_hash ? 'present' : 'missing', type, next })

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (!error) {
      // Check user role to route them correctly
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // Tenant users go to set-password page
        if (profile?.role === 'tenant') {
          return NextResponse.redirect(`${origin}/set-password`)
        }
      }

      // Default: landlord or unknown role goes to next or dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('verifyOtp error:', error.message)
  }

  // Token missing or verification failed
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
