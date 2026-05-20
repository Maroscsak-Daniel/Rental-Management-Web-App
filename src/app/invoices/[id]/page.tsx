import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import PaymentForm from './PaymentForm'

async function getInvoiceDetails(id: string) {
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      tenants:tenant_id (*),
      payments (*)
    `)
    .eq('id', id)
    .single()

  if (error || !invoice) {
    console.error('getInvoiceDetails error:', error)
    return null
  }

  return invoice
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoiceDetails(id)

  if (!invoice) {
    notFound()
  }

  const totalPaid = (invoice.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0)
  const balance = Math.max(0, invoice.amount - totalPaid)
  
  const isPaid = invoice.status === 'paid'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/invoices" className="text-sm text-slate-500 hover:text-[#781C21] flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Invoices
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Invoice #{invoice.id.split('-')[0]}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {new Date(invoice.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Invoice Details Card */}
            <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Details</h3>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Billed To</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {invoice.tenants?.first_name} {invoice.tenants?.last_name}
                      <br />
                      {invoice.tenants?.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Status</dt>
                    <dd className="mt-1">
                      {isPaid ? (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Paid</span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">{invoice.status.toUpperCase()}</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Due Date</dt>
                    <dd className="mt-1 text-sm text-slate-900">{new Date(invoice.due_date).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Category</dt>
                    <dd className="mt-1 text-sm text-slate-900 capitalize">{invoice.category}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Payments History Card */}
            <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Payment History</h3>
              </div>
              <div className="px-6 py-5">
                {invoice.payments?.length === 0 ? (
                  <p className="text-sm text-slate-500">No payments recorded yet.</p>
                ) : (
                  <ul role="list" className="divide-y divide-slate-100">
                    {invoice.payments?.map((payment: any) => (
                      <li key={payment.id} className="py-4 flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Payment</p>
                          <p className="text-xs text-slate-500">{new Date(payment.payment_date).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm font-semibold text-emerald-600">${Number(payment.amount).toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Summary</h3>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Total Amount</span>
                  <span>${Number(invoice.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Total Paid</span>
                  <span>-${totalPaid.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between text-base font-bold text-slate-900">
                  <span>Balance Due</span>
                  <span>${balance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Record Payment Action */}
            {!isPaid && (
              <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h3 className="text-base font-semibold leading-6 text-slate-900">Record Payment</h3>
                </div>
                <div className="px-6 py-5">
                  <PaymentForm invoiceId={invoice.id} maxAmount={balance} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
