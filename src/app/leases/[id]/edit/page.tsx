'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { updateLease } from '../../actions'
import { createClient } from '@/lib/supabase/client'

export default function EditLeasePage({ params }: { params: Promise<{ id: string }> }) {
  const [leaseId, setLeaseId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [lease, setLease] = useState<{
    start_date: string
    end_date: string
    rent_amount: number
    status: string
    tenant_id: string
  } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { id } = await params
      setLeaseId(id)

      const { data, error } = await supabase
        .from('leases')
        .select('start_date, end_date, rent_amount, status, tenant_id')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('Lease not found.')
      } else {
        setLease(data)
      }
      setFetching(false)
    }
    load()
  }, [params, supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateLease(leaseId, formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/leases')
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-slate-500 text-center py-10">Loading...</div>
        </main>
      </div>
    )
  }

  if (!lease) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-red-600 text-center py-10">Lease not found.</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Lease</h1>
            <p className="mt-1 text-sm text-slate-500">
              Update lease dates and rent amount.
            </p>
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
                <label htmlFor="start_date" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  id="start_date"
                  defaultValue={lease.start_date}
                  required
                  className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-slate-700 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  id="end_date"
                  defaultValue={lease.end_date}
                  required
                  className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
                />
              </div>
            </div>

            <div className="max-w-xs">
              <label htmlFor="rent_amount" className="block text-sm font-medium text-slate-700 mb-1.5">
                Monthly Rent ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="rent_amount"
                id="rent_amount"
                defaultValue={lease.rent_amount}
                required
                className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-x-4 border-t border-slate-100 px-6 py-4 bg-slate-50/50 rounded-b-xl">
            <Link
              href="/leases"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[#781C21] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#61161a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#781C21] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
