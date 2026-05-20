import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deactivateTenant, reactivateTenant } from '../actions'

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !tenant) notFound()

  const { data: activeLease } = await supabase
    .from('leases')
    .select(`
      id,
      start_date,
      end_date,
      rent_amount,
      status,
      units (
        floor,
        apartment_number,
        buildings ( name )
      )
    `)
    .eq('tenant_id', id)
    .eq('status', 'active')
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unit = activeLease?.units as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const building = unit?.buildings as any

  const isActive = tenant.status === 'active'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8 border-b border-slate-200 pb-5">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {tenant.first_name} {tenant.last_name}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/50'
                    : 'bg-slate-100 text-slate-500 ring-slate-200/50'
                }`}
              >
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
            <Link
              href={`/tenants/${id}/edit`}
              className="inline-flex items-center rounded-md bg-white border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Edit
            </Link>
            {isActive ? (
              <form
                action={async () => {
                  'use server'
                  await deactivateTenant(id)
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
                >
                  Deactivate
                </button>
              </form>
            ) : (
              <form
                action={async () => {
                  'use server'
                  await reactivateTenant(id)
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-600 shadow-sm hover:bg-emerald-100"
                >
                  Reactivate
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Tenant info */}
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm mb-6">
          <div className="px-4 py-6 sm:p-8">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-slate-500">Email</dt>
                <dd className="mt-1 text-sm text-slate-900">{tenant.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Phone</dt>
                <dd className="mt-1 text-sm text-slate-900">{tenant.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Member Since</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {new Date(tenant.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Active lease */}
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Active Lease</h2>
            {!activeLease && (
              <Link
                href={`/leases/new?tenant=${id}`}
                className="rounded-md bg-[#781C21] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#61161a]"
              >
                Create Lease
              </Link>
            )}
          </div>
          <div className="px-4 py-5 sm:p-8">
            {activeLease ? (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-slate-500">Unit</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {building?.name}{unit?.apartment_number ? ` — Apt ${unit.apartment_number}` : unit?.floor ? ` — Floor ${unit.floor}` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Monthly Rent</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    ${Number(activeLease.rent_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Start</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {new Date(activeLease.start_date).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">End</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {new Date(activeLease.end_date).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-slate-400">No active lease.</p>
            )}
            {activeLease && (
              <div className="mt-4">
                <Link
                  href={`/leases/${activeLease.id}`}
                  className="text-sm font-medium text-[#781C21] hover:underline"
                >
                  View lease →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
