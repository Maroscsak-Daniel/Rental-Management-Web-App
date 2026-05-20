'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createLease } from '../actions'
import { createClient } from '@/lib/supabase/client'

function LeaseForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<{ id: string; first_name: string; last_name: string }[]>([])
  const [units, setUnits] = useState<{ id: string; floor: string | null; rent_amount: number; buildings: { name: string } }[]>([])
  const [fetching, setFetching] = useState(true)
  const [selectedRent, setSelectedRent] = useState<number>(0)

  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedTenantId = searchParams.get('tenant')

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const [tenantsRes, unitsRes] = await Promise.all([
        supabase.from('tenants').select('id, first_name, last_name').order('first_name'),
        supabase.from('units').select('id, floor, rent_amount, buildings(name)').order('floor'),
      ])

      if (tenantsRes.data) setTenants(tenantsRes.data)
      if (unitsRes.data) {
        // @ts-expect-error join type
        setUnits(unitsRes.data)
        if (unitsRes.data.length > 0) {
          setSelectedRent(unitsRes.data[0].rent_amount)
        }
      }
      setFetching(false)
    }
    loadData()
  }, [supabase])

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unit = units.find((u) => u.id === e.target.value)
    if (unit) {
      setSelectedRent(unit.rent_amount)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createLease(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/leases')
    }
  }

  if (fetching) {
    return <div className="text-slate-500 text-center py-10">Loading...</div>
  }

  if (tenants.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-600 mb-3">You need to create a tenant first.</p>
        <Link href="/tenants/new" className="text-[#781C21] font-medium hover:underline">
          Create a Tenant →
        </Link>
      </div>
    )
  }

  if (units.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-600 mb-3">You need to add a unit to your portfolio first.</p>
        <Link href="/units" className="text-[#781C21] font-medium hover:underline">
          View Units →
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
              defaultValue={preselectedTenantId || tenants[0]?.id}
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
            <label htmlFor="unit_id" className="block text-sm font-medium text-slate-700 mb-1.5">
              Unit
            </label>
            <select
              id="unit_id"
              name="unit_id"
              required
              onChange={handleUnitChange}
              className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.floor || 'N/A'} - {u.buildings?.name || 'N/A'} (${u.rent_amount}/mo)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-slate-700 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              id="start_date"
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
              required
              className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-1 max-w-xs">
          <label htmlFor="rent_amount" className="block text-sm font-medium text-slate-700 mb-1.5">
            Monthly Rent ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="rent_amount"
            id="rent_amount"
            value={selectedRent}
            onChange={(e) => setSelectedRent(parseFloat(e.target.value) || 0)}
            required
            className="block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm"
          />
          <p className="mt-1.5 text-xs text-slate-400">Pre-filled from the selected unit. You can override it.</p>
        </div>
      </div>

      {error && (
        <div className="px-6 pb-4">
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200/60 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {error}
          </div>
        </div>
      )}

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
          {loading ? 'Creating...' : 'Create Lease'}
        </button>
      </div>
    </form>
  )
}

export default function NewLeasePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Lease</h1>
            <p className="mt-1 text-sm text-slate-500">
              Assign a tenant to a vacant unit.
            </p>
          </div>
        </div>

        <Suspense fallback={<div className="text-slate-500 text-center py-10">Loading...</div>}>
          <LeaseForm />
        </Suspense>
      </main>
    </div>
  )
}
