import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { terminateLease } from '../actions'

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200/50',
  expired: 'bg-amber-50 text-amber-700 ring-amber-200/50',
  terminated: 'bg-red-50 text-red-700 ring-red-200/50',
}

export default async function LeaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lease, error } = await supabase
    .from('leases')
    .select(`
      id,
      start_date,
      end_date,
      rent_amount,
      status,
      tenants ( id, first_name, last_name, email ),
      units (
        id,
        floor,
        apartment_number,
        buildings ( name, address )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !lease) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenant = lease.tenants as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unit = lease.units as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const building = unit?.buildings as any

  const isActive = lease.status === 'active'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/leases"
              className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
            >
              ← Back to Leases
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lease Detail</h1>
          </div>
          <div className="flex gap-3">
            {isActive && (
              <>
                <Link
                  href={`/leases/${id}/edit`}
                  className="inline-flex items-center rounded-md bg-white border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Edit
                </Link>
                <form
                  action={async () => {
                    'use server'
                    await terminateLease(id)
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
                  >
                    Terminate
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Lease info */}
          <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
            <div className="px-4 py-4 sm:px-6 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Lease Info</h2>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        STATUS_STYLES[lease.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200/50'
                      }`}
                    >
                      {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">Monthly Rent</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    ${Number(lease.rent_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">Start Date</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {new Date(lease.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">End Date</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {new Date(lease.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Tenant info */}
          <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
            <div className="px-4 py-4 sm:px-6 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Tenant</h2>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {tenant ? (
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">Name</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      <Link href={`/tenants/${tenant.id}`} className="hover:underline text-[#781C21]">
                        {tenant.first_name} {tenant.last_name}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">Email</dt>
                    <dd className="mt-1 text-sm text-slate-900">{tenant.email}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-slate-400">No tenant data.</p>
              )}
            </div>
          </div>

          {/* Unit info */}
          <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm sm:col-span-2">
            <div className="px-4 py-4 sm:px-6 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Unit</h2>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {unit ? (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">Building</dt>
                    <dd className="mt-1 text-sm text-slate-900">{building?.name ?? '—'}</dd>
                    <dd className="text-xs text-slate-500">{building?.address ?? ''}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">Unit</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {unit.apartment_number ? `Apt ${unit.apartment_number}` : unit.floor ? `Floor ${unit.floor}` : '—'}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-slate-400">No unit data.</p>
              )}
              {unit && (
                <div className="mt-4">
                  <Link href={`/units/${unit.id}`} className="text-sm font-medium text-[#781C21] hover:underline">
                    View unit →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
