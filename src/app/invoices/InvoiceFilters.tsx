'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function InvoiceFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentMonth = searchParams.get('month') || 'all'
  const currentStatus = searchParams.get('status') || 'all'

  // Generate future and past months for the filter (6 months ahead, 12 months back)
  const months = []
  const today = new Date()
  for (let i = -6; i <= 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` // YYYY-MM safely
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
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 max-w-xs">
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

      <div className="flex-1 max-w-xs">
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
