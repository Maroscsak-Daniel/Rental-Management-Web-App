import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MaintenanceStatusBadge from '@/components/MaintenanceStatusBadge'
import { MaintenanceStatus } from '@/lib/definitions'
import { computeDaysOpen, isOverdueOpenRequest } from '@/lib/maintenance/days-open'
import { MAINTENANCE_STATUS_LABELS } from '@/lib/maintenance/state-machine'
import MaintenanceUpdateForm from './MaintenanceUpdateForm'
import { formatTenantName } from '@/lib/tenants/format-name'

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const { data: request, error } = await supabase
    .from('maintenance_requests')
    .select(
      `
      *,
      units!inner (
        id,
        floor,
        buildings!inner (id, name, landlord_id)
      ),
      tenants (id, first_name, last_name)
    `
    )
    .eq('id', id)
    .single()

  if (error || !request) {
    notFound()
  }

  if ((request.units.buildings as { landlord_id: string }).landlord_id !== user.id) {
    notFound()
  }

  const status = request.status as MaintenanceStatus
  const daysOpen = computeDaysOpen(
    request.reported_at,
    request.status,
    request.resolved_at
  )
  const stale = isOverdueOpenRequest(status, daysOpen)

  const timeline = [
    {
      label: 'Reported',
      date: request.reported_at,
      detail: 'Request opened',
    },
    ...(status !== 'open'
      ? [
          {
            label: MAINTENANCE_STATUS_LABELS.in_progress,
            date: request.reported_at,
            detail: 'Status moved to in progress',
          },
        ]
      : []),
    ...(status === 'resolved' && request.resolved_at
      ? [
          {
            label: 'Resolved',
            date: request.resolved_at,
            detail: request.resolution_notes || 'Marked as resolved',
          },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {stale && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <span>
              This request has been open for <strong>{daysOpen} days</strong>{' '}
              without resolution.
            </span>
          </div>
        )}

        <div className="md:flex md:items-center md:justify-between mb-8 border-b border-slate-200 pb-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Maintenance Request
            </h2>
            <div className="mt-2 flex items-center gap-3">
              <MaintenanceStatusBadge status={status} />
              <span className="text-sm text-slate-500">
                {daysOpen} day{daysOpen !== 1 ? 's' : ''} open
              </span>
            </div>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/maintenance"
              className="inline-flex items-center rounded-md bg-white border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Back to list
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
            <div className="px-4 py-6 sm:p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Details</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">
                    {request.description}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">Building</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    <Link
                      href={`/buildings/${request.units.buildings.id}`}
                      className="hover:underline"
                    >
                      {request.units.buildings.name}
                    </Link>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">Unit</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    <Link
                      href={`/units/${request.units.id}`}
                      className="hover:underline"
                    >
                      Floor {request.units.floor || 'N/A'}
                    </Link>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">
                    Submitted by
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {request.tenants
                      ? formatTenantName(
                          request.tenants.first_name,
                          request.tenants.last_name
                        )
                      : 'Landlord (admin)'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">
                    Reported at
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {new Date(request.reported_at).toLocaleString()}
                  </dd>
                </div>
                {request.resolved_at && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-slate-500">
                      Resolved at
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {new Date(request.resolved_at).toLocaleString()}
                    </dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">
                    Resolution notes
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">
                    {request.resolution_notes || '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-8">
            <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
              <div className="px-4 py-6 sm:p-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">
                  History
                </h3>
                <ol className="relative border-l border-slate-200 ml-3">
                  {timeline.map((event, index) => (
                    <li key={index} className="mb-8 ml-6">
                      <span className="absolute -left-1.5 flex h-3 w-3 rounded-full bg-[#617891]" />
                      <h4 className="text-sm font-semibold text-slate-900">
                        {event.label}
                      </h4>
                      <time className="block text-xs text-slate-400 mb-1">
                        {new Date(event.date).toLocaleString()}
                      </time>
                      <p className="text-sm text-slate-500">{event.detail}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Update status
              </h3>
              <MaintenanceUpdateForm
                id={request.id}
                currentStatus={status}
                currentNotes={request.resolution_notes}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
