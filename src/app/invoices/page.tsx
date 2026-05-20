import { Suspense } from 'react'
import Link from 'next/link'
import { getInvoices } from './actions'
import Navbar from '@/components/Navbar'
import InvoiceFilters from './InvoiceFilters'

function isOverdue(dueDateStr: string, status: string): boolean {
  if (status === 'paid') return false
  const d = new Date()
  const localToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return dueDateStr < localToday
}

function StatusBadge({ status, overdue }: { status: string, overdue: boolean }) {
  if (status === 'paid') {
    return <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Paid</span>
  }
  if (status === 'overdue' || overdue) {
    return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Overdue</span>
  }
  return <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">Pending</span>
}

async function InvoicesList({ month, status, tenant }: { month: string, status: string, tenant: string }) {
  const result = await getInvoices(month, status, tenant)
  const invoices = result.data || []

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm ring-1 ring-slate-200 mt-6">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-slate-900">No invoices</h3>
        <p className="mt-1 text-sm text-slate-500">No invoices found matching your filters.</p>
        <div className="mt-6">
          <Link
            href="/invoices/new"
            className="inline-flex items-center rounded-md bg-[#781C21] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#61161a]"
          >
            Create Invoice
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Tenant
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Amount
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Due Date
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {invoices.map((invoice: any) => {
                  const totalPaid = (invoice.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0)
                  const balance = Math.max(0, invoice.amount - totalPaid)
                  const overdue = isOverdue(invoice.due_date, invoice.status)

                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {invoice.tenants?.first_name} {invoice.tenants?.last_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="text-gray-900">${invoice.amount.toFixed(2)}</div>
                        {balance > 0 && balance < invoice.amount && (
                          <div className="text-xs text-gray-500">Bal: ${balance.toFixed(2)}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                        {invoice.category}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <StatusBadge status={invoice.status} overdue={overdue} />
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href={`/invoices/${invoice.id}`} className="text-[#781C21] hover:text-[#61161a]">
                          View<span className="sr-only">, invoice {invoice.id}</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const month = params.month || 'all'
  const status = params.status || 'all'
  const tenant = params.tenant || 'all'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoices</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your billing, track rent payments, and view outstanding balances.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:flex-none flex gap-3">
            <Link
              href="/invoices/new"
              className="block rounded-md bg-[#781C21] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#61161a]"
            >
              New Invoice
            </Link>
          </div>
        </div>

        <InvoiceFilters />

        <Suspense fallback={<div className="text-slate-500 text-center py-10">Loading invoices...</div>} key={`${month}-${status}-${tenant}`}>
          <InvoicesList month={month} status={status} tenant={tenant} />
        </Suspense>
      </main>
    </div>
  )
}
