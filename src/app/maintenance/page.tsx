import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import MaintenanceStatusBadge from '@/components/MaintenanceStatusBadge'
import { MaintenanceStatus } from '@/lib/definitions'
import {
  computeDaysOpen,
  isOverdueOpenRequest,
} from '@/lib/maintenance/days-open'

type MaintenanceListRow = {
  id: string
  description: string
  reported_at: string
  status: MaintenanceStatus
  resolved_at: string | null
  submitted_by_tenant_id: string | null
  units: {
    id: string
    floor: string | null
    buildings: { id: string; name: string }
  }
  tenants: { id: string; first_name: string; last_name: string } | null
}

export default async function MaintenancePage() {
  const supabase = await createClient()

  const { data: requests, error } = await supabase
    .from('maintenance_requests')
    .select(
      `
      id,
      description,
      reported_at,
      status,
      resolved_at,
      submitted_by_tenant_id,
      units!inner (
        id,
        floor,
        buildings!inner (id, name)
      ),
      tenants (id, first_name, last_name)
    `
    )
    .order('reported_at', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Maintenance
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Track and resolve maintenance requests across your portfolio.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/maintenance/new"
              className="block rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-black shadow-sm hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              New Request
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-8 text-red-500">
            Error loading maintenance requests: {error.message}
          </div>
        ) : (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-white/10 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-zinc-800">
                    <thead className="bg-zinc-900">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6"
                        >
                          Unit
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Days Open
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Reported
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">View</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
                      {(requests as unknown as MaintenanceListRow[] | null)?.map(
                        (request) => {
                          const daysOpen = computeDaysOpen(
                            request.reported_at,
                            request.status,
                            request.resolved_at
                          )
                          const overdue = isOverdueOpenRequest(
                            request.status,
                            daysOpen
                          )
                          const unitLabel = `${request.units.buildings.name} — Floor ${request.units.floor || 'N/A'}`

                          return (
                            <tr
                              key={request.id}
                              className={`hover:bg-zinc-800/50 ${overdue ? 'bg-red-500/5' : ''}`}
                            >
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                                <div className="flex items-center gap-2">
                                  {overdue && (
                                    <span
                                      title="Open more than 7 days"
                                      className="text-red-400"
                                      aria-hidden
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                                        <path d="M12 9v4" />
                                        <path d="M12 17h.01" />
                                      </svg>
                                    </span>
                                  )}
                                  <Link
                                    href={`/maintenance/${request.id}`}
                                    className="hover:underline"
                                  >
                                    {unitLabel}
                                  </Link>
                                </div>
                              </td>
                              <td className="max-w-xs truncate px-3 py-4 text-sm text-zinc-300">
                                {request.description}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <MaintenanceStatusBadge
                                  status={request.status}
                                />
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span
                                  className={
                                    overdue
                                      ? 'inline-flex items-center rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20'
                                      : 'text-zinc-300'
                                  }
                                >
                                  {daysOpen}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-300">
                                {new Date(
                                  request.reported_at
                                ).toLocaleDateString()}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <Link
                                  href={`/maintenance/${request.id}`}
                                  className="text-zinc-400 hover:text-white"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          )
                        }
                      )}
                      {(!requests || requests.length === 0) && (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-sm text-zinc-400"
                          >
                            No maintenance requests yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
