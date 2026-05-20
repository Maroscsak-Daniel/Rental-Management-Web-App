import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch summary stats
  const { count: buildingsCount } = await supabase
    .from('buildings')
    .select('*', { count: 'exact', head: true })

  const { count: unitsCount } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })

  const { count: occupiedCount } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'occupied')

  const { count: vacantCount } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'vacant')

  const { count: tenantsCount } = await supabase
    .from('tenants')
    .select('*', { count: 'exact', head: true })

  const { count: activeLeaseCount } = await supabase
    .from('leases')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Leases expiring within 30 days
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  const thirtyDaysFromNowStr = thirtyDaysFromNow.toISOString().split('T')[0]

  const { data: expiringLeases } = await supabase
    .from('leases')
    .select(`
      id,
      end_date,
      tenants(first_name, last_name),
      units(floor, buildings(name))
    `)
    .eq('landlord_id', user?.id)
    .eq('status', 'active')
    .gte('end_date', today)
    .lte('end_date', thirtyDaysFromNowStr)
    .order('end_date', { ascending: true })
    .limit(5)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
            <dt className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500">Buildings</dt>
            <dd className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{buildingsCount || 0}</dd>
          </div>

          <div className="overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
            <dt className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500">Total Units</dt>
            <dd className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{unitsCount || 0}</dd>
          </div>

          <div className="overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
            <dt className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500">Occupied</dt>
            <dd className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">{occupiedCount || 0}</dd>
          </div>

          <div className="overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
            <dt className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500">Vacant</dt>
            <dd className="mt-2 text-2xl font-bold tracking-tight text-amber-600">{vacantCount || 0}</dd>
          </div>

          <div className="overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
            <dt className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500">Tenants</dt>
            <dd className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{tenantsCount || 0}</dd>
          </div>

          <div className="overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
            <dt className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500">Active Leases</dt>
            <dd className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{activeLeaseCount || 0}</dd>
          </div>
        </div>

        {/* Expiring Leases */}
        <div className="mt-8 bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Expiring Leases (next 30 days)</h2>
            <Link href="/leases" className="text-sm font-medium text-[#781C21] hover:underline">
              View all →
            </Link>
          </div>
          {expiringLeases && expiringLeases.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-slate-200/60">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tenant</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Unit</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Lease End</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Days Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {expiringLeases.map((lease) => {
                    const daysLeft = Math.floor(
                      (new Date(lease.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    )
                    return (
                      <tr key={lease.id} className="hover:bg-slate-50 transition-colors">
                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-slate-900">
                          {/* @ts-expect-error join type */}
                          {lease.tenants?.first_name} {lease.tenants?.last_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-500">
                          {/* @ts-expect-error join type */}
                          {lease.units?.floor || 'N/A'} - {lease.units?.buildings?.name || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-500">
                          {new Date(lease.end_date).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            daysLeft <= 7
                              ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200/50'
                              : daysLeft <= 14
                              ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/50'
                              : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200/50'
                          }`}>
                            {daysLeft} days
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No leases expiring in the next 30 days.</p>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/buildings" className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition-all hover:shadow-md hover:ring-slate-300">
            <h3 className="text-base font-semibold text-slate-900 mb-1">Buildings →</h3>
            <p className="text-sm text-slate-500">Manage your properties</p>
          </Link>

          <Link href="/units" className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition-all hover:shadow-md hover:ring-slate-300">
            <h3 className="text-base font-semibold text-slate-900 mb-1">Units →</h3>
            <p className="text-sm text-slate-500">View and manage units</p>
          </Link>

          <Link href="/tenants" className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition-all hover:shadow-md hover:ring-slate-300">
            <h3 className="text-base font-semibold text-slate-900 mb-1">Tenants →</h3>
            <p className="text-sm text-slate-500">Manage tenant profiles</p>
          </Link>

          <Link href="/leases" className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition-all hover:shadow-md hover:ring-slate-300">
            <h3 className="text-base font-semibold text-slate-900 mb-1">Leases →</h3>
            <p className="text-sm text-slate-500">View lease agreements</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
