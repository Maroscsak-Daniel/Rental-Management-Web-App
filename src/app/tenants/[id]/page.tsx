import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DocumentUpload from '@/components/DocumentUpload'
import { formatUnitLabel } from '@/lib/display'

export default async function TenantProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch tenant with leases, units, buildings
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select(`
      *,
      leases(
        id,
        start_date,
        end_date,
        rent_amount,
        status,
        units(
          id,
          floor,
          apartment_number,
          buildings(name)
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !tenant) {
    notFound()
  }

  // Fetch documents for this tenant
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('tenant_id', id)
    .order('created_at', { ascending: false })

  const activeLease = tenant.leases?.find((l: { status: string }) => l.status === 'active')
  const isActive = !!activeLease

  // Check if tenant has a portal account
  // Using admin client because RLS on profiles only allows users to see their own row
  const adminSupabase = createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('id')
    .eq('tenant_id', id)
    .eq('role', 'tenant')
    .single()

  const hasPortalAccess = !!profile

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {tenant.first_name} {tenant.last_name}
              </h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/50'
                  : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200/50'
              }`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Tenant profile and lease information</p>
          </div>
          <div className="mt-4 flex gap-3 md:ml-4 md:mt-0">
            <Link
              href="/tenants"
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              ← Back
            </Link>
            <Link
              href={`/tenants/${tenant.id}/edit`}
              className="inline-flex items-center rounded-md bg-[#781C21] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#61161a] transition-colors"
            >
              Edit Tenant
            </Link>
          </div>
        </div>

        {/* Info Grid */}
        <div className="bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</p>
                <p className="mt-0.5 text-sm text-slate-900">{tenant.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</p>
                <p className="mt-0.5 text-sm text-slate-900">{tenant.phone || '—'}</p>
              </div>
            </div>

            {/* Unit */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</p>
                <p className="mt-0.5 text-sm text-slate-900">
                  {activeLease ? (
                    <>
                      {formatUnitLabel(activeLease.units)}
                    </>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
            </div>

            {/* Lease Period */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Lease Period</p>
                <p className="mt-0.5 text-sm text-slate-900">
                  {activeLease
                    ? `${new Date(activeLease.start_date).toLocaleDateString()} → ${new Date(activeLease.end_date).toLocaleDateString()}`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Documents + Login Account */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Documents */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
            </div>
            <DocumentUpload
              entityType="tenant"
              entityId={tenant.id}
              documents={documents || []}
            />
          </div>

          {/* Login Account */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Login Account</h2>
            {hasPortalAccess ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span className="text-sm font-medium">Portal Access Enabled</span>
                </div>
                <p className="text-sm text-slate-500">Tenant can access the tenant portal with their email and password.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
                  <span className="text-sm font-medium">No Portal Access</span>
                </div>
                <p className="text-sm text-slate-500">This tenant does not have a portal login account.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lease History */}
        <div className="bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Lease History</h2>
            <Link
              href={`/leases/new?tenant=${tenant.id}`}
              className="inline-flex items-center rounded-md bg-[#781C21] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#61161a] transition-colors"
            >
              + New Lease
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200/60">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:pl-4">Unit</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Start</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">End</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rent</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tenant.leases?.map((lease: { id: string; start_date: string; end_date: string; rent_amount: number; status: string; units: { floor: string | null; apartment_number: string | null; buildings: { name: string } | null } | null }) => (
                  <tr key={lease.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-slate-900 sm:pl-4">
                      {lease.units ? formatUnitLabel(lease.units) : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-500">
                      {new Date(lease.start_date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-500">
                      {new Date(lease.end_date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-900 font-medium">
                      ${lease.rent_amount}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm">
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
                  </tr>
                ))}
                {tenant.leases?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                      No lease history. Click &apos;+ New Lease&apos; to assign a unit.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
