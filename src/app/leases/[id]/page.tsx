import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatUnitLabel } from '@/lib/display'
import { terminateLease } from '../actions'

export default async function LeaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: lease, error } = await supabase
    .from('leases')
    .select(
      `
      *,
      tenants ( id, first_name, last_name, email ),
      units (
        id,
        floor,
        apartment_number,
        buildings ( id, name, address )
      )
    `
    )
    .eq('id', id)
    .eq('landlord_id', user.id)
    .single()

  if (error || !lease) {
    notFound()
  }

  const tenant = lease.tenants as {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  const unit = lease.units as {
    id: string
    floor: string | null
    apartment_number: string | null
    buildings: { id: string; name: string; address: string }
  }

  const statusStyles: Record<string, string> = {
    active:
      'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/50',
    expired: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/50',
    terminated: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200/50',
  }

  return (
    <div className="min-h-screen bg-slate-50 md:pl-64">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/leases"
              className="text-sm text-slate-500 hover:text-[#781C21] mb-2 inline-block"
            >
              ← Back to Leases
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Lease — {tenant.first_name} {tenant.last_name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {formatUnitLabel({
                floor: unit.floor,
                apartment_number: unit.apartment_number,
                buildings: unit.buildings,
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/leases/${id}/edit`}
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Edit
            </Link>
            {lease.status === 'active' && (
              <form
                action={async () => {
                  'use server'
                  await terminateLease(id)
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  Terminate
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Status
              </dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[lease.status] ?? statusStyles.terminated}`}
                >
                  {lease.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Rent
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                ${lease.rent_amount}/mo
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Start date
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {new Date(lease.start_date + 'T00:00:00').toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                End date
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {new Date(lease.end_date + 'T00:00:00').toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Tenant
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                <Link
                  href={`/tenants/${tenant.id}`}
                  className="text-[#781C21] hover:underline"
                >
                  {tenant.first_name} {tenant.last_name}
                </Link>
                <span className="block text-slate-500">{tenant.email}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Building
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                <Link
                  href={`/buildings/${unit.buildings.id}`}
                  className="text-[#781C21] hover:underline"
                >
                  {unit.buildings.name}
                </Link>
                <span className="block text-slate-500">{unit.buildings.address}</span>
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  )
}
