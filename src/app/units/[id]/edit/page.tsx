import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { updateUnit } from '../../actions'

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: unit, error } = await supabase
    .from('units')
    .select('id, building_id, floor, apartment_number, size_sqm, rent_amount, status')
    .eq('id', id)
    .single()

  if (error || !unit) notFound()

  const { data: buildings } = await supabase
    .from('buildings')
    .select('id, name')
    .order('name')

  const action = async (formData: FormData) => {
    'use server'
    const result = await updateUnit(id, formData)
    if (!result?.error) redirect(`/units/${id}`)
  }

  const inputClass =
    'block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm'
  const selectClass =
    'block w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#781C21] focus:outline-none focus:ring-1 focus:ring-[#781C21] sm:text-sm'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Unit</h1>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href={`/units/${id}`}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>

        <form action={action} className="bg-white shadow-sm ring-1 ring-slate-200/60 rounded-xl">
          <div className="px-6 py-8 space-y-6">
            <div>
              <label htmlFor="building_id" className="block text-sm font-medium text-slate-700 mb-1.5">
                Building
              </label>
              <select
                id="building_id"
                name="building_id"
                defaultValue={unit.building_id}
                required
                className={selectClass}
              >
                {buildings?.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="apartment_number" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Apartment Number <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="apartment_number"
                  id="apartment_number"
                  defaultValue={unit.apartment_number ?? ''}
                  autoComplete="off"
                  className={inputClass}
                  placeholder="e.g. 12A, 304"
                />
              </div>

              <div>
                <label htmlFor="floor" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Floor <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="floor"
                  id="floor"
                  defaultValue={unit.floor ?? ''}
                  autoComplete="off"
                  className={inputClass}
                  placeholder="e.g. Ground, 3rd"
                />
              </div>

              <div>
                <label htmlFor="size_sqm" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Size (m²) <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="size_sqm"
                  id="size_sqm"
                  defaultValue={unit.size_sqm ?? ''}
                  className={inputClass}
                  placeholder="45.5"
                />
              </div>

              <div>
                <label htmlFor="rent_amount" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Rent Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="rent_amount"
                  id="rent_amount"
                  defaultValue={unit.rent_amount}
                  required
                  className={inputClass}
                  placeholder="1500.00"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={unit.status}
                  className={selectClass}
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-x-4 border-t border-slate-100 px-6 py-4 bg-slate-50/50 rounded-b-xl">
            <Link
              href={`/units/${id}`}
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
