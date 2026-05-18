'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // The redirect URL where the user lands after clicking the email link
    const resetUrl = `${window.location.origin}/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#25344F] p-4">
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-500">Enter your email to receive a reset link</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {success ? (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200 text-center">
            <p className="font-semibold mb-2">Check your email!</p>
            <p>We've sent you a password reset link. Please check your inbox and spam folder.</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#25344F] focus:outline-none focus:ring-1 focus:ring-[#25344F] sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-[#781C21] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#61161a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#781C21] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-[#781C21] hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
