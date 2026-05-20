import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MaintenanceStatusBadge from '@/components/MaintenanceStatusBadge'
import { MaintenanceStatus } from '@/lib/definitions'
import { computeDaysOpen } from '@/lib/maintenance/days-open'
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

  const { data: request, error } = await supabase
    .from('maintenance_requests')
    .select(
      `
      *,
      units!inner (
        id,
        floor,
        buildings!inner (id, name)
      ),
      tenants (id, first_name, last_name)
    `
    )
    .eq('id', id)
    .single()

  if (error || !request) {
    notFound()
  }

  const status = request.status as MaintenanceStatus
  const daysOpen = computeDaysOpen(
    request.reported_at,
    request.status,
    request.resolved_at
  )

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
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8 border-b border-zinc-800 pb-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
              Maintenance Request
            </h2>
            <div className="mt-2 flex items-center gap-3">
              <MaintenanceStatusBadge status={status} />
              <span className="text-sm text-zinc-400">
                {daysOpen} day{daysOpen !== 1 ? 's' : ''} open
              </span>
            </div>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/maintenance"
              className="inline-flex items-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700"
            >
              Back to list
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm">
            <div className="px-4 py-6 sm:p-8">
              <h3 className="text-lg font-semibold text-white mb-6">Details</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-zinc-400">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-white whitespace-pre-wrap">
                    {request.description}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-zinc-400">Building</dt>
                  <dd className="mt-1 text-sm text-white">
                    <Link
                      href={`/buildings/${request.units.buildings.id}`}
                      className="hover:underline"
                    >
                      {request.units.buildings.name}
                    </Link>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-zinc-400">Unit</dt>
                  <dd className="mt-1 text-sm text-white">
                    <Link
                      href={`/units/${request.units.id}`}
                      className="hover:underline"
                    >
                      Floor {request.units.floor || 'N/A'}
                    </Link>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-zinc-400">
                    Submitted by
                  </dt>
                  <dd className="mt-1 text-sm text-white">
                    {request.tenants
                      ? formatTenantName(
                          request.tenants.first_name,
                          request.tenants.last_name
                        )
                      : 'Landlord (admin)'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-zinc-400">
                    Reported at
                  </dt>
                  <dd className="mt-1 text-sm text-white">
                    {new Date(request.reported_at).toLocaleString()}
                  </dd>
                </div>
                {request.resolved_at && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-zinc-400">
                      Resolved at
                    </dt>
                    <dd className="mt-1 text-sm text-white">
                      {new Date(request.resolved_at).toLocaleString()}
                    </dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-zinc-400">
                    Resolution notes
                  </dt>
                  <dd className="mt-1 text-sm text-white whitespace-pre-wrap">
                    {request.resolution_notes || '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-8">
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm">
              <div className="px-4 py-6 sm:p-8">
                <h3 className="text-lg font-semibold text-white mb-6">
                  History
                </h3>
                <ol className="relative border-l border-zinc-700 ml-3">
                  {timeline.map((event, index) => (
                    <li key={index} className="mb-8 ml-6">
                      <span className="absolute -left-1.5 flex h-3 w-3 rounded-full bg-[#617891]" />
                      <h4 className="text-sm font-semibold text-white">
                        {event.label}
                      </h4>
                      <time className="block text-xs text-zinc-500 mb-1">
                        {new Date(event.date).toLocaleString()}
                      </time>
                      <p className="text-sm text-zinc-400">{event.detail}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
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
