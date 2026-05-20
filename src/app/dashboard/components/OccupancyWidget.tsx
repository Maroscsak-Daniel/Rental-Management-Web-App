import Link from 'next/link'
import { getOccupancyByBuilding } from '@/lib/dashboard/get-occupancy-by-building'
import DashboardEmptyState from './DashboardEmptyState'

export default async function OccupancyWidget() {
  const { data, error } = await getOccupancyByBuilding()

  if (error) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <h2 className="text-lg font-semibold text-slate-900">Occupancy by Building</h2>
        <p className="mt-4 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
      <h2 className="text-lg font-semibold text-slate-900">Occupancy by Building</h2>
      <p className="mt-1 text-sm text-slate-500">
        Occupied units have an active lease (not unit status alone).
      </p>

      {data.length === 0 ? (
        <DashboardEmptyState
          title="No buildings yet"
          description="Add a building to start tracking occupancy."
          actionHref="/buildings/new"
          actionLabel="Add building"
        />
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200/60">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-2.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Building
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Occupied
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Vacant
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-slate-900">
                    <Link
                      href={`/buildings/${row.id}`}
                      className="hover:text-[#781C21]"
                    >
                      {row.name}
                    </Link>
                    <p className="text-xs font-normal text-slate-500 truncate max-w-[200px]">
                      {row.address}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-emerald-700 font-medium">
                    {row.occupiedUnits}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-amber-700 font-medium">
                    {row.vacantUnits}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600">
                    {row.totalUnits}
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
