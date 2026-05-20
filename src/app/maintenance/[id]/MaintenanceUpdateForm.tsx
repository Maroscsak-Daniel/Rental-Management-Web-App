'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MaintenanceStatus } from '@/lib/definitions'
import {
  getAllowedNextStatuses,
  MAINTENANCE_STATUS_LABELS,
} from '@/lib/maintenance/state-machine'
import { updateMaintenanceRequest } from '../actions'

export default function MaintenanceUpdateForm({
  id,
  currentStatus,
  currentNotes,
}: {
  id: string
  currentStatus: MaintenanceStatus
  currentNotes: string | null
}) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const isResolved = currentStatus === 'resolved'
  const allowedStatuses = isResolved
    ? [currentStatus]
    : [currentStatus, ...getAllowedNextStatuses(currentStatus)]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isResolved) return

    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateMaintenanceRequest(id, formData)

    if (result && 'error' in result && result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
      setLoading(false)
    }
  }

  if (isResolved) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
        <p className="text-sm text-zinc-400">
          This request is resolved. Status and resolution notes cannot be
          changed.
        </p>
        {currentNotes && (
          <p className="mt-3 text-sm text-white whitespace-pre-wrap">
            {currentNotes}
          </p>
        )}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900/50 shadow-sm ring-1 ring-white/10 sm:rounded-xl"
    >
      <div className="px-4 py-6 sm:p-8 space-y-6">
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium leading-6 text-white"
          >
            Status
          </label>
          <div className="mt-2">
            <select
              id="status"
              name="status"
              defaultValue={currentStatus}
              className="block w-full rounded-md border-0 bg-white/5 py-2 pl-3 pr-10 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm [&>option]:text-black"
            >
              {allowedStatuses.map((status) => (
                <option key={status} value={status}>
                  {MAINTENANCE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="resolution_notes"
            className="block text-sm font-medium leading-6 text-white"
          >
            Resolution Notes
          </label>
          <div className="mt-2">
            <textarea
              id="resolution_notes"
              name="resolution_notes"
              rows={4}
              defaultValue={currentNotes ?? ''}
              className="block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm"
              placeholder="Notes about how the issue was resolved..."
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 sm:px-8">
          <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end border-t border-white/10 px-4 py-4 sm:px-8">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Update Request'}
        </button>
      </div>
    </form>
  )
}
