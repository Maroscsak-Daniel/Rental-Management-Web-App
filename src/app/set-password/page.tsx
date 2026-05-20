'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    // Sign out after setting password — they'll log in fresh
    setTimeout(async () => {
      await supabase.auth.signOut()
      router.push('/login')
    }, 3000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Set Your Password
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Welcome! Please create a password for your tenant portal account.
          </p>
        </div>

        {success ? (
          <div className="bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Password Set Successfully!</h2>
            <p className="text-sm text-slate-500">
              Redirecting you to the login page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl">
            <div className="px-6 py-8 space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200/60 flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
                  placeholder="Re-enter your password"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50 rounded-b-xl">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#781C21] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#61161a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#781C21] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting Password...' : 'Set Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
