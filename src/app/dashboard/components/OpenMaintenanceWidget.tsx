import Link from 'next/link'
import { getOpenMaintenance } from '@/lib/dashboard/get-open-maintenance'
import DashboardEmptyState from './DashboardEmptyState'
import MaintenanceStatusBadge from '@/components/MaintenanceStatusBadge'

export default async function OpenMaintenanceWidget() {
  const { data, error } = await getOpenMaintenance()

  if (error) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <h2 className="text-lg font-semibold text-slate-900">Open Maintenance</h2>
        <p className="mt-4 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
      <h2 className="text-lg font-semibold text-slate-900">Open Maintenance</h2>
      <p className="mt-1 text-sm text-slate-500">
        Requests that are open or in progress.
      </p>

      {data.length === 0 ? (
        <DashboardEmptyState
          title="No open requests"
          description="All maintenance requests are resolved or in progress elsewhere."
          actionHref="/maintenance"
          actionLabel="View maintenance"
        />
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200/60">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-2.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Unit
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Days open
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-3 pl-4 pr-3 text-sm">
                    <Link
                      href={`/maintenance/${row.id}`}
                      className="font-medium text-slate-900 hover:text-[#781C21]"
                    >
                      {row.unitLabel}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                      {row.description}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm">
                    <MaintenanceStatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        row.isStale ? 'text-red-700' : 'text-slate-600'
                      }`}
                    >
                      {row.isStale && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                        </svg>
                      )}
                      {row.daysOpen}d
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
