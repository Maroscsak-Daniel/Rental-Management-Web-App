import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { terminateLease } from './actions'
import { formatUnitLabel } from '@/lib/display'

export default async function LeasesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase.from('leases').select(`
      *,
      tenants(first_name, last_name),
      units(
        id,
        floor,
        apartment_number,
        buildings(name)
      )
    `)

  if (user) {
    query = query.eq('landlord_id', user.id)
  }

  const { data: leases, error } = await query.order('created_at', {
    ascending: false,
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leases</h1>
            <p className="mt-1 text-sm text-slate-500">
              All lease agreements across your rental properties.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/leases/new"
              id="add-lease-btn"
              className="inline-flex items-center rounded-md bg-[#781C21] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#61161a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#781C21]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 15h6"/></svg>
              New Lease
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200/60">
            Error loading leases: {error.message}
          </div>
        ) : (
          <div className="mt-8">
            <div className="overflow-hidden bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:pl-6">Tenant</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Unit</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Start</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">End</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rent</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {leases?.map((lease) => (
                    <tr key={lease.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                        <Link href={`/leases/${lease.id}`} className="hover:text-[#781C21] transition-colors">
                          {lease.tenants?.first_name} {lease.tenants?.last_name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {lease.units ? formatUnitLabel(lease.units) : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {new Date(lease.start_date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {new Date(lease.end_date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900 font-medium">
                        ${lease.rent_amount}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          lease.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/50'
                            : lease.status === 'expired'
                            ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/50'
                            : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200/50'
                        }`}>
                          {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-3">
                          <Link href={`/leases/${lease.id}/edit`} className="text-slate-400 hover:text-slate-600 transition-colors" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </Link>
                          {lease.status === 'active' && (
                            <form action={async () => {
                              'use server'
                              await terminateLease(lease.id)
                            }}>
                              <button type="submit" className="text-red-400 hover:text-red-600 transition-colors" title="Terminate">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {leases?.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                        <p className="text-sm text-slate-500">No leases found.</p>
                        <p className="text-sm text-slate-400 mt-1">Click &apos;New Lease&apos; to create one.</p>
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
