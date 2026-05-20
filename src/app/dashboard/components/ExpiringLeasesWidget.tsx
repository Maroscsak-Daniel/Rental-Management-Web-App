import Link from 'next/link'
import { getExpiringLeases } from '@/lib/leases/get-expiring-leases'
import { formatUnitLabel } from '@/lib/display'
import DashboardEmptyState from './DashboardEmptyState'

export default async function ExpiringLeasesWidget() {
  const { data, error } = await getExpiringLeases()

  if (error) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <h2 className="text-lg font-semibold text-slate-900">Expiring Leases</h2>
        <p className="mt-4 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
      <h2 className="text-lg font-semibold text-slate-900">Expiring Leases</h2>
      <p className="mt-1 text-sm text-slate-500">Active leases ending in the next 30 days.</p>

      {data.length === 0 ? (
        <DashboardEmptyState
          title="No upcoming expirations"
          description="No active leases expire in the next 30 days."
          actionHref="/leases"
          actionLabel="View leases"
        />
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200/60">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-2.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tenant
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Unit
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  End date
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Days left
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.map((lease) => (
                <tr key={lease.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-slate-900">
                    <Link
                      href={`/leases/${lease.id}`}
                      className="hover:text-[#781C21]"
                    >
                      {lease.tenant.first_name} {lease.tenant.last_name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-500">
                    {formatUnitLabel({
                      floor: lease.unit.floor,
                      apartment_number: lease.unit.apartment_number,
                      buildings: lease.unit.buildings,
                    })}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-500">
                    {new Date(lease.end_date + 'T00:00:00').toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        lease.days_remaining <= 7
                          ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200/50'
                          : lease.days_remaining <= 14
                            ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/50'
                            : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200/50'
                      }`}
                    >
                      {lease.days_remaining} days
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
