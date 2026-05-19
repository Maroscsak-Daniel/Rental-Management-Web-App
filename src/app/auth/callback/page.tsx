'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Processing your invitation...')
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Check if the URL has hash fragments (tokens from Supabase invite flow)
    const hasHashTokens = window.location.hash.includes('access_token')

    if (hasHashTokens) {
      // Hash fragments detected — the Supabase client will auto-process them
      // and fire a SIGNED_IN event with the NEW session (not the old landlord one).
      // We must NOT call getSession() here because it would return the old session.
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth event:', event)

          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
            // New session from the hash fragment — this is the tenant
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single()

            subscription.unsubscribe()

            if (profile?.role === 'tenant') {
              setStatus('Welcome! Redirecting to set your password...')
              router.push('/set-password')
            } else {
              setStatus('Welcome back! Redirecting...')
              router.push('/dashboard')
            }
          }
        }
      )

      // Timeout fallback
      setTimeout(() => {
        subscription.unsubscribe()
        setStatus('Authentication failed. The link may have expired.')
        setTimeout(() => router.push('/auth/auth-code-error'), 2000)
      }, 8000)
    } else {
      // No hash fragments — redirect to error (no code/token provided)
      setStatus('No authentication data found. Redirecting...')
      setTimeout(() => router.push('/auth/auth-code-error'), 1500)
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#781C21]" />
        <p className="text-sm text-slate-600">{status}</p>
      </div>
    </div>
  )
}
