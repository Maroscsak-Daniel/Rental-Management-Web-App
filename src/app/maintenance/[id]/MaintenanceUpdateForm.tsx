'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MaintenanceStatus } from '@/lib/definitions'
import { getAllowedNextStatuses, MAINTENANCE_STATUS_LABELS } from '@/lib/maintenance/state-machine'

export default function MaintenanceUpdateForm({
  id,
  currentStatus,
  currentResolutionNotes,
}: {
  id: string
  currentStatus: MaintenanceStatus
  currentResolutionNotes: string | null
}) {
  const allowedNext = getAllowedNextStatuses(currentStatus)
  const statusOptions: MaintenanceStatus[] = [currentStatus, ...allowedNext]
  const [status, setStatus] = useState<MaintenanceStatus>(currentStatus)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  if (currentStatus === 'resolved') {
    return (
      <p className="text-sm text-slate-400">
        This request has been resolved and cannot be updated further.
      </p>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const noteText = note.trim()

    // Require either a status change or a note
    if (status === currentStatus && !noteText) {
      setError('Please change the status or add a note.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          resolution_notes: noteText || currentResolutionNotes,
          note: noteText || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to update. Please try again.')
        setLoading(false)
        return
      }

      setNote('')
      setSuccess(true)
      setLoading(false)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const selectClass =
    'block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm'
  const textareaClass =
    'block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1.5">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as MaintenanceStatus)
            setSuccess(false)
          }}
          className={selectClass}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{MAINTENANCE_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-slate-700 mb-1.5">
          Note <span className="text-slate-400 font-normal">(will appear in history)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            setSuccess(false)
          }}
          className={textareaClass}
          placeholder="Add a note about what was done..."
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 border border-emerald-500/20">
          Updated successfully.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[#781C21] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#61161a] disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
