import { getTenantContext } from '@/lib/tenants/get-tenant-context'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TenantPortalPage() {
  const { adminSupabase, tenantId } = await getTenantContext()

  // Fetch tenant name
  const { data: tenant } = await adminSupabase
    .from('tenants')
    .select('first_name, last_name')
    .eq('id', tenantId)
    .single()

  // Fetch active lease with unit + building joins
  const { data: activeLease } = await adminSupabase
    .from('leases')
    .select(`
      id,
      start_date,
      end_date,
      rent_amount,
      status,
      units:unit_id (
        id,
        floor,
        apartment_number,
        size_sqm,
        buildings:building_id (
          id,
          name,
          address
        )
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Count pending invoices
  const { count: pendingInvoiceCount } = await adminSupabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .in('status', ['pending', 'overdue'])

  // Count open maintenance requests
  const { count: openMaintenanceCount } = await adminSupabase
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .eq('submitted_by_tenant_id', tenantId)
    .in('status', ['open', 'in_progress'])

  const tenantName = tenant
    ? `${tenant.first_name} ${tenant.last_name}`
    : 'Tenant'

  // Type helpers for the nested joins (Supabase may return arrays without !inner)
  const unitArray = activeLease?.units as any
  const unit = Array.isArray(unitArray) ? unitArray[0] : unitArray

  const buildingArray = unit?.buildings as any
  const building = Array.isArray(buildingArray) ? buildingArray[0] : buildingArray

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Welcome, {tenantName}
        </h1>
        <p className="mt-1 text-slate-500">
          Here&apos;s an overview of your rental information.
        </p>
      </div>

      {/* Active Lease Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#25344F]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
          <h2 className="text-lg font-semibold text-slate-900">Active Lease</h2>
        </div>
        <div className="px-6 py-5">
          {activeLease ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Building</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {building?.name || '—'}
                </p>
                <p className="text-xs text-slate-500">{building?.address || ''}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Unit</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {unit?.apartment_number
                    ? `Apt ${unit.apartment_number}`
                    : unit?.floor
                      ? `Floor ${unit.floor}`
                      : '—'}
                  {unit?.size_sqm ? ` · ${unit.size_sqm} m²` : ''}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Monthly Rent</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  ${Number(activeLease.rent_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Lease Start</p>
                <p className="mt-1 text-sm text-slate-700">
                  {new Date(activeLease.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Lease End</p>
                <p className="mt-1 text-sm text-slate-700">
                  {new Date(activeLease.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Status</p>
                <span className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  Active
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
              <p className="text-sm font-medium text-slate-500">No Active Lease</p>
              <p className="text-xs text-slate-400 mt-1">
                You don&apos;t have an active lease right now. Contact your landlord for details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Invoices Card */}
        <Link
          href="/tenant/invoices"
          className="group block bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#25344F]/30 transition-all p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Invoices</h3>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-[#25344F] transition-colors"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
          {pendingInvoiceCount && pendingInvoiceCount > 0 ? (
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-amber-600">{pendingInvoiceCount}</span>{' '}
              pending or overdue {pendingInvoiceCount === 1 ? 'invoice' : 'invoices'}
            </p>
          ) : (
            <p className="text-sm text-slate-500">All invoices are paid. View history →</p>
          )}
        </Link>

        {/* Maintenance Card */}
        <Link
          href="/tenant/maintenance"
          className="group block bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#25344F]/30 transition-all p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Maintenance</h3>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-[#25344F] transition-colors"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
          {openMaintenanceCount && openMaintenanceCount > 0 ? (
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-blue-600">{openMaintenanceCount}</span>{' '}
              open {openMaintenanceCount === 1 ? 'request' : 'requests'}
            </p>
          ) : (
            <p className="text-sm text-slate-500">No open requests. Submit a new one →</p>
          )}
        </Link>
      </div>
    </div>
  )
}
