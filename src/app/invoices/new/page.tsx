'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createInvoice } from '../actions'
import { createClient } from '@/lib/supabase/client'

function InvoiceForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('tenants').select('id, first_name, last_name, leases(id, status)')
      if (data) setTenants(data)
      setFetching(false)
    }
    loadData()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createInvoice(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/invoices')
    }
  }

  if (fetching) {
    return <div className="text-slate-500 text-center py-10">Loading...</div>
  }

  if (tenants.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-600 mb-3">You need to create a tenant before issuing invoices.</p>
        <Link href="/tenants/new" className="text-[#781C21] font-medium hover:underline">
          Create a Tenant →
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl">
      <div className="px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="tenant_id" className="block text-sm font-medium text-slate-700 mb-1.5">
              Tenant
            </label>
            <select
              id="tenant_id"
              name="tenant_id"
              required
              className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.first_name} {t.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1.5">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
            >
              <option value="rent">Rent</option>
              <option value="utilities">Utilities</option>
              <option value="repairs">Repairs</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1.5">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="amount"
              id="amount"
              required
              className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-slate-700 mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              name="due_date"
              id="due_date"
              required
              defaultValue={new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]} // Default 1 month from now
              className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="px-6 pb-4">
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200/60">
            {error}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-x-4 border-t border-slate-100 px-6 py-4 bg-slate-50/50 rounded-b-xl">
        <Link
          href="/invoices"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[#781C21] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#61161a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#781C21] disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>
    </form>
  )
}

export default function NewInvoicePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Invoice</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manually issue an invoice for rent, deposits, or extra fees.
          </p>
        </div>

        <Suspense fallback={<div className="text-slate-500 text-center py-10">Loading...</div>}>
          <InvoiceForm />
        </Suspense>
      </main>
    </div>
  )
}
