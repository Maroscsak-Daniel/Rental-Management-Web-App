'use client'

import { useState, useEffect } from 'react'
import { submitTenantMaintenanceRequest, getTenantMaintenanceRequests } from './actions'
import type { TenantMaintenanceRequest } from './actions'

const statusStyles: Record<string, string> = {
  open: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  in_progress: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
}

const statusLabels: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

export default function TenantMaintenancePage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<TenantMaintenanceRequest[]>([])
  const [listError, setListError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(true)

  const loadRequests = async () => {
    setListLoading(true)
    const result = await getTenantMaintenanceRequests()
    setRequests(result.data)
    setListError(result.error)
    setListLoading(false)
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const result = await submitTenantMaintenanceRequest(formData)

    if (result && 'error' in result && result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      e.currentTarget.reset()
      // Refresh the list
      loadRequests()
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Maintenance</h1>
        <p className="mt-1 text-slate-500">
          Submit a new request or track existing ones.
        </p>
      </div>

      {/* Submit Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#25344F]"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          <h2 className="text-lg font-semibold text-slate-900">New Request</h2>
        </div>
        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-700 border border-emerald-500/20">
              Your maintenance request has been submitted successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <div className="mt-1.5">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-[#25344F] focus:outline-none focus:ring-1 focus:ring-[#25344F] sm:text-sm"
                  placeholder="Describe the issue you're experiencing..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-[#781C21] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#61161a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#781C21] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>

      {/* Request List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#25344F]"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          <h2 className="text-lg font-semibold text-slate-900">Your Requests</h2>
        </div>

        {listError && (
          <div className="px-6 py-4">
            <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
              {listError}
            </div>
          </div>
        )}

        {listLoading ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#25344F]" />
            <p className="text-sm text-slate-400">Loading requests…</p>
          </div>
        ) : requests.length === 0 && !listError ? (
          <div className="text-center py-12 px-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-3"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            <p className="text-sm font-medium text-slate-500">No Maintenance Requests</p>
            <p className="text-xs text-slate-400 mt-1">
              You haven&apos;t submitted any maintenance requests yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((req) => {
              const unit = req.units as any
              const building = unit?.buildings as any
              return (
                <div key={req.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-900 line-clamp-2">{req.description}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>
                          {new Date(req.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {building?.name && (
                          <span>
                            {building.name}
                            {unit?.apartment_number ? ` · Apt ${unit.apartment_number}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        statusStyles[req.status] ?? 'bg-slate-50 text-slate-600 ring-slate-500/20'
                      }`}
                    >
                      {statusLabels[req.status] ?? req.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

