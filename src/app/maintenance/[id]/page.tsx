import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MaintenanceStatusBadge from '@/components/MaintenanceStatusBadge'
import { computeDaysOpen, isOverdueOpenRequest } from '@/lib/maintenance/days-open'
import { MaintenanceStatus } from '@/lib/definitions'
import MaintenanceUpdateForm from './MaintenanceUpdateForm'
import { MaintenanceNote } from '@/lib/definitions'

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: request, error } = await supabase
    .from('maintenance_requests')
    .select(`
      id,
      description,
      resolution_notes,
      reported_at,
      status,
      resolved_at,
      submitted_by_tenant_id,
      units!unit_id (
        id,
        floor,
        apartment_number,
        buildings!building_id ( id, name )
      ),
      tenants!submitted_by_tenant_id ( id, first_name, last_name )
    `)
    .eq('id', id)
    .single()

  if (error || !request) notFound()

  const { data: notes } = await supabase
    .from('maintenance_notes')
    .select('id, note, status_at_time, created_at')
    .eq('maintenance_request_id', id)
    .order('created_at', { ascending: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unit = request.units as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const building = Array.isArray(unit?.buildings) ? unit.buildings[0] : unit?.buildings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenant = request.tenants as any

  const status = request.status as MaintenanceStatus
  const daysOpen = computeDaysOpen(request.reported_at, status, request.resolved_at)
  const overdue = isOverdueOpenRequest(status, daysOpen)

  const unitLabel = unit
    ? `${building?.name ?? '—'} — ${unit.apartment_number ? `Apt ${unit.apartment_number}` : unit.floor ? `Floor ${unit.floor}` : 'Unit'}`
    : '—'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-2xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 border-b border-slate-200 pb-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Maintenance Request
              </h1>
              <MaintenanceStatusBadge status={status} />
              {overdue && (
                <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500 ring-1 ring-inset ring-red-500/20">
                  Stale (&gt;7 days)
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">{unitLabel}</p>
          </div>
          <Link
            href="/maintenance"
            className="ml-4 shrink-0 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            ← Back
          </Link>
        </div>

        {/* Details */}
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm mb-6">
          <div className="px-4 py-4 sm:px-6 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Details</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Description</dt>
                <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{request.description}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500">Unit</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {unit ? (
                    <Link href={`/units/${unit.id}`} className="text-[#781C21] hover:underline">
                      {unitLabel}
                    </Link>
                  ) : '—'}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500">Submitted By</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {tenant ? (
                    <Link href={`/tenants/${tenant.id}`} className="text-[#781C21] hover:underline">
                      {tenant.first_name} {tenant.last_name}
                    </Link>
                  ) : 'Landlord'}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500">Reported</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {new Date(request.reported_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500">Days Open</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  <span className={overdue ? 'font-semibold text-red-500' : ''}>{daysOpen}</span>
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Resolution Notes</dt>
                <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">
                  {request.resolution_notes || <span className="text-slate-400">None</span>}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Notes history */}
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm mb-6">
          <div className="px-4 py-4 sm:px-6 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">History</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {notes && notes.length > 0 ? (
              <ol className="relative border-l border-slate-200 space-y-6 ml-3">
                {(notes as Pick<MaintenanceNote, 'id' | 'note' | 'status_at_time' | 'created_at'>[]).map((entry) => (
                  <li key={entry.id} className="ml-6">
                    <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#25344F] ring-4 ring-white" />
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <MaintenanceStatusBadge status={entry.status_at_time as MaintenanceStatus} />
                      <span className="text-xs text-slate-400">
                        {new Date(entry.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}{' '}
                        {new Date(entry.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.note}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-400">No notes logged yet. Add a note when updating the status.</p>
            )}
          </div>
        </div>

        {/* Update form */}
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Update</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <MaintenanceUpdateForm
              id={id}
              currentStatus={status}
              currentResolutionNotes={request.resolution_notes}
            />
          </div>
        </div>

      </main>
    </div>
  )
}
