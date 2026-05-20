import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { updateTenant } from '../../actions'

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('id, first_name, last_name, email, phone, status')
    .eq('id', id)
    .single()

  if (error || !tenant) notFound()

  const action = async (formData: FormData) => {
    'use server'
    const result = await updateTenant(id, formData)
    if (!result?.error) redirect(`/tenants/${id}`)
  }

  const inputClass =
    'block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Tenant</h1>
            <p className="mt-1 text-sm text-slate-500">
              Update {tenant.first_name} {tenant.last_name}&apos;s profile.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href={`/tenants/${id}`}
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
                <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  defaultValue={tenant.first_name}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  defaultValue={tenant.last_name}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <p className="text-sm text-slate-900 bg-slate-50 rounded-md border border-slate-200 px-3 py-2">
                {tenant.email}
              </p>
              <p className="mt-1.5 text-xs text-slate-400">Email cannot be changed after account creation.</p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                defaultValue={tenant.phone ?? ''}
                className={inputClass}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                name="status"
                id="status"
                defaultValue={tenant.status}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-x-4 border-t border-slate-100 px-6 py-4 bg-slate-50/50 rounded-b-xl">
            <Link
              href={`/tenants/${id}`}
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
