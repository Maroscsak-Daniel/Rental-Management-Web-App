'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createTenant } from '../actions'

export default function NewTenantPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createTenant(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/tenants')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Tenant</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create a tenant profile. A login account will be created automatically.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/tenants"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200/60 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl">
          <div className="px-6 py-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  autoComplete="given-name"
                  required
                  className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  autoComplete="family-name"
                  required
                  className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
                  placeholder="Smith"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
                placeholder="john.smith@email.com"
              />
              <p className="mt-1.5 text-xs text-slate-400">This email will be used for the tenant&apos;s portal login.</p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                autoComplete="tel"
                className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-x-4 border-t border-slate-100 px-6 py-4 bg-slate-50/50 rounded-b-xl">
            <Link
              href="/tenants"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[#781C21] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#61161a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#781C21] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
