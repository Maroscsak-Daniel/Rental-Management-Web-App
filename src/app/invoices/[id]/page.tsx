import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch invoice details
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      tenants(first_name, last_name, email, phone)
    `)
    .eq('id', id)
    .single()

  if (error || !invoice) {
    notFound()
  }

  // Calculate status
  const d = new Date()
  const localToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const isOverdue = invoice.status !== 'paid' && invoice.due_date < localToday
  const displayStatus = invoice.status === 'paid' ? 'paid' : isOverdue ? 'overdue' : 'pending'

  const statusStyles: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    overdue: 'bg-red-50 text-red-700 ring-red-600/20',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Invoice Details
              </h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${statusStyles[displayStatus] || statusStyles.pending}`}>
                {displayStatus}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Invoice #{invoice.id.split('-')[0]}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/invoices"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              Back
            </Link>
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#25344F] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1b2a40]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download PDF
            </a>
          </div>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl overflow-hidden">
          <div className="px-6 py-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
          </div>
          <div className="px-6 py-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              <div>
                <dt className="text-sm font-medium text-slate-500">Tenant</dt>
                <dd className="mt-1 text-base text-slate-900">
                  {invoice.tenants?.first_name} {invoice.tenants?.last_name}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-slate-500">Amount</dt>
                <dd className="mt-1 text-2xl font-bold text-slate-900">
                  ${Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500">Due Date</dt>
                <dd className="mt-1 text-base text-slate-900">
                  {new Date(invoice.due_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500">Category</dt>
                <dd className="mt-1 text-base text-slate-900 capitalize">
                  {invoice.category}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  )
}
