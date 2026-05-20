import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { updateLease } from '../../actions'

export default async function EditLeasePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lease, error } = await supabase
    .from('leases')
    .select('id, start_date, end_date, rent_amount, status, tenants(first_name, last_name)')
    .eq('id', id)
    .single()

  if (error || !lease) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenant = lease.tenants as any

  const action = async (formData: FormData) => {
    'use server'
    const result = await updateLease(id, formData)
    if (!result?.error) redirect(`/leases/${id}`)
  }

  const inputClass =
    'block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Lease</h1>
            {tenant && (
              <p className="mt-1 text-sm text-slate-500">
                {tenant.first_name} {tenant.last_name}
              </p>
            )}
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href={`/leases/${id}`}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>

        <form action={action} className="bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl">
          <div className="px-6 py-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  id="start_date"
                  defaultValue={lease.start_date}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-slate-700 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  id="end_date"
                  defaultValue={lease.end_date}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="max-w-xs">
              <label htmlFor="rent_amount" className="block text-sm font-medium text-slate-700 mb-1.5">
                Monthly Rent ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="rent_amount"
                id="rent_amount"
                defaultValue={lease.rent_amount}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-x-4 border-t border-slate-100 px-6 py-4 bg-slate-50/50 rounded-b-xl">
            <Link
              href={`/leases/${id}`}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-md bg-[#781C21] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#61161a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#781C21]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
