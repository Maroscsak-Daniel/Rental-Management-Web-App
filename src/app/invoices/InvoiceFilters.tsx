'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Tenant = { id: string; first_name: string; last_name: string }

export default function InvoiceFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentMonth = searchParams.get('month') || 'all'
  const currentStatus = searchParams.get('status') || 'all'
  const currentTenant = searchParams.get('tenant') || 'all'

  const [tenants, setTenants] = useState<Tenant[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('tenants')
      .select('id, first_name, last_name')
      .order('first_name')
      .then(({ data }) => {
        if (data) setTenants(data)
      })
  }, [])

  // Generate past 12 months + 6 future months for the month filter
  const months = []
  const today = new Date()
  for (let i = -6; i <= 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' })
    months.push({ value: monthStr, label })
  }

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-wrap">
      <div className="flex-1 min-w-[160px] max-w-xs">
        <label htmlFor="tenant" className="block text-sm font-medium text-slate-700 mb-1">
          Tenant
        </label>
        <select
          id="tenant"
          value={currentTenant}
          onChange={(e) => updateFilters('tenant', e.target.value)}
          className="block w-full rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-[#781C21] focus:outline-none focus:ring-[#781C21] sm:text-sm border"
        >
          <option value="all">All Tenants</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.first_name} {t.last_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[160px] max-w-xs">
        <label htmlFor="month" className="block text-sm font-medium text-slate-700 mb-1">
          Month
        </label>
        <select
          id="month"
          value={currentMonth}
          onChange={(e) => updateFilters('month', e.target.value)}
          className="block w-full rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-[#781C21] focus:outline-none focus:ring-[#781C21] sm:text-sm border"
        >
          <option value="all">All Months</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[160px] max-w-xs">
        <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
          Status
        </label>
        <select
          id="status"
          value={currentStatus}
          onChange={(e) => updateFilters('status', e.target.value)}
          className="block w-full rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-[#781C21] focus:outline-none focus:ring-[#781C21] sm:text-sm border"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
    </div>
  )
}
