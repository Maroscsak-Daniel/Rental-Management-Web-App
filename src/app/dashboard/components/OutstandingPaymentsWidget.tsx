import Link from 'next/link'
import { getOutstandingInvoices } from '@/lib/dashboard/get-outstanding-invoices'
import DashboardEmptyState from './DashboardEmptyState'

export default async function OutstandingPaymentsWidget() {
  const { data, error } = await getOutstandingInvoices()
  const monthLabel = new Date().toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  if (error) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <h2 className="text-lg font-semibold text-slate-900">Outstanding Payments</h2>
        <p className="mt-4 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
      <h2 className="text-lg font-semibold text-slate-900">Outstanding Payments</h2>
      <p className="mt-1 text-sm text-slate-500">
        Pending or overdue invoices due in {monthLabel}.
      </p>

      {data.length === 0 ? (
        <DashboardEmptyState
          title="All caught up"
          description="No pending or overdue invoices due this month."
          actionHref="/invoices"
          actionLabel="View invoices"
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
                  Due
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-slate-900">
                    <Link
                      href={`/invoices/${row.id}`}
                      className="hover:text-[#781C21]"
                    >
                      {row.tenantName}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-500">{row.unitLabel}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-500">
                    {new Date(row.due_date + 'T00:00:00').toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-slate-900">
                    <span
                      className={
                        row.status === 'overdue' ? 'text-red-700' : 'text-slate-900'
                      }
                    >
                      ${row.amount}
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
