import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { updateBuilding } from '../../actions'

export default async function EditBuildingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: building, error } = await supabase
    .from('buildings')
    .select('id, name, address')
    .eq('id', id)
    .single()

  if (error || !building) notFound()

  const action = async (formData: FormData) => {
    'use server'
    const result = await updateBuilding(id, formData)
    if (!result?.error) redirect(`/buildings/${id}`)
  }

  const inputClass =
    'block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Building</h1>
            <p className="mt-1 text-sm text-slate-500">Update {building.name}&apos;s details.</p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href={`/buildings/${id}`}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>

        <form action={action} className="bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl">
          <div className="px-6 py-8 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Building Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={building.name}
                required
                autoComplete="off"
                className={inputClass}
                placeholder="Sunset Towers"
              />
              <p className="mt-1.5 text-xs text-slate-400">Must be unique across your properties.</p>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1.5">
                Address
              </label>
              <input
                type="text"
                name="address"
                id="address"
                defaultValue={building.address}
                required
                autoComplete="street-address"
                className={inputClass}
                placeholder="Str. Unirii, Nr. 1, City Cluj-Napoca"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-x-4 border-t border-slate-100 px-6 py-4 bg-slate-50/50 rounded-b-xl">
            <Link
              href={`/buildings/${id}`}
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
