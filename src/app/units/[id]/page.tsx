import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteUnit } from '../actions'
import { redirect } from 'next/navigation'

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: unit, error } = await supabase
    .from('units')
    .select(`
      *,
      buildings:building_id ( id, name, address )
    `)
    .eq('id', id)
    .single()

  if (error || !unit) notFound()

  const { data: activeLease } = await supabase
    .from('leases')
    .select(`
      id,
      start_date,
      end_date,
      rent_amount,
      status,
      tenants:tenant_id ( first_name, last_name )
    `)
    .eq('unit_id', id)
    .eq('status', 'active')
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const building = unit.buildings as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenant = activeLease?.tenants as any

  const deleteAction = async () => {
    'use server'
    await deleteUnit(id)
    redirect('/units')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8 border-b border-slate-200 pb-5">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {unit.apartment_number
                ? `Apt ${unit.apartment_number}`
                : unit.floor
                  ? `Floor ${unit.floor}`
                  : 'Unit'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {building?.name}
              {building?.address ? ` · ${building.address}` : ''}
            </p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                  unit.status === 'occupied'
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/50'
                    : 'bg-slate-100 text-slate-500 ring-slate-200/50'
                }`}
              >
                {unit.status === 'occupied' ? 'Occupied' : 'Vacant'}
              </span>
            </div>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
            <Link
              href={`/units/${id}/edit`}
              className="inline-flex items-center rounded-md bg-white border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Edit
            </Link>
            <form action={deleteAction}>
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
              >
                Delete
              </button>
            </form>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm mb-6">
          <div className="px-4 py-4 sm:px-6 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Details</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-slate-500">Building</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  <Link href={`/buildings/${building?.id}`} className="text-[#781C21] hover:underline">
                    {building?.name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Apartment Number</dt>
                <dd className="mt-1 text-sm text-slate-900">{unit.apartment_number || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Floor</dt>
                <dd className="mt-1 text-sm text-slate-900">{unit.floor || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Size</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {unit.size_sqm ? `${unit.size_sqm} m²` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Monthly Rent</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  ${Number(unit.rent_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Created</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {new Date(unit.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Active Lease</h2>
            {!activeLease && (
              <Link
                href={`/leases/new?unit=${id}`}
                className="rounded-md bg-[#781C21] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#61161a]"
              >
                Create Lease
              </Link>
            )}
          </div>
          <div className="px-4 py-5 sm:p-6">
            {activeLease ? (
              <>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Tenant</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {tenant ? `${tenant.first_name} ${tenant.last_name}` : '—'}
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
                <div className="mt-4">
                  <Link
                    href={`/leases/${activeLease.id}`}
                    className="text-sm font-medium text-[#781C21] hover:underline"
                  >
                    View lease →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">No active lease.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
