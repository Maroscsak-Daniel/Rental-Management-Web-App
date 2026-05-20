import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { deactivateTenant, reactivateTenant } from './actions'
import { formatUnitLabel } from '@/lib/display'

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const { view } = await searchParams
  const showInactive = view === 'inactive'

  const supabase = await createClient()

  // Fetch tenants filtered by status
  const query = supabase
    .from('tenants')
    .select(`
      *,
      leases(
        id,
        end_date,
        status,
        units(
          id,
          floor,
          apartment_number,
          buildings(name)
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (showInactive) {
    query.eq('status', 'inactive')
  } else {
    query.eq('status', 'active')
  }

  const { data: tenants, error } = await query

  // Derive lease status from lease data
  const tenantsWithStatus = tenants?.map((tenant) => {
    const activeLease = tenant.leases?.find((l: { status: string }) => l.status === 'active')
    return {
      ...tenant,
      activeLease,
      hasActiveLease: !!activeLease,
    }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tenants</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage all tenants across your rental properties.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/tenants/new"
              id="add-tenant-btn"
              className="inline-flex items-center rounded-md bg-[#781C21] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#61161a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#781C21]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
              Add Tenant
            </Link>
          </div>
        </div>

        {/* Active / Inactive Tabs */}
        <div className="mt-6 border-b border-slate-200">
          <nav className="-mb-px flex gap-x-6" aria-label="Tabs">
            <Link
              href="/tenants"
              className={`whitespace-nowrap border-b-2 pb-3 px-1 text-sm font-medium transition-colors ${
                !showInactive
                  ? 'border-[#781C21] text-[#781C21]'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              Active
            </Link>
            <Link
              href="/tenants?view=inactive"
              className={`whitespace-nowrap border-b-2 pb-3 px-1 text-sm font-medium transition-colors ${
                showInactive
                  ? 'border-[#781C21] text-[#781C21]'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              Inactive
            </Link>
          </nav>
        </div>
        
        {error ? (
          <div className="mt-8 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200/60">
            Error loading tenants: {error.message}
          </div>
        ) : (
          <div className="mt-6">
            <div className="overflow-hidden bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Unit
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Lease End
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Lease
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {tenantsWithStatus?.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                        <Link href={`/tenants/${tenant.id}`} className="hover:text-[#781C21] transition-colors">
                          {tenant.first_name} {tenant.last_name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {tenant.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {tenant.activeLease ? (
                          <>
                            {formatUnitLabel(tenant.activeLease.units)}
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {tenant.activeLease ? (
                          new Date(tenant.activeLease.end_date).toLocaleDateString()
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          tenant.hasActiveLease
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/50'
                            : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200/50'
                        }`}>
                          {tenant.hasActiveLease ? 'Active Lease' : 'No Lease'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-3">
                          <Link href={`/tenants/${tenant.id}`} className="text-slate-400 hover:text-slate-600 transition-colors" title="View">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          </Link>
                          <Link href={`/tenants/${tenant.id}/edit`} className="text-slate-400 hover:text-slate-600 transition-colors" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </Link>
                          {showInactive ? (
                            <form action={async () => {
                              'use server'
                              await reactivateTenant(tenant.id)
                            }}>
                              <button type="submit" className="text-emerald-400 hover:text-emerald-600 transition-colors" title="Reactivate">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                              </button>
                            </form>
                          ) : (
                            <form action={async () => {
                              'use server'
                              await deactivateTenant(tenant.id)
                            }}>
                              <button type="submit" className="text-slate-400 hover:text-amber-500 transition-colors" title="Deactivate">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" x2="16" y1="12" y2="12"/></svg>
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tenantsWithStatus?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <p className="text-sm text-slate-500">
                          {showInactive ? 'No inactive tenants.' : 'No active tenants found.'}
                        </p>
                        {!showInactive && (
                          <p className="text-sm text-slate-400 mt-1">Click &apos;Add Tenant&apos; to get started.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
