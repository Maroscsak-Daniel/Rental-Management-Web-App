import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { deleteUnit } from './actions'

export default async function UnitsPage() {
  const supabase = await createClient()

  const { data: units, error } = await supabase
    .from('units')
    .select('*, buildings!inner(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Units</h1>
            <p className="mt-2 text-sm text-slate-500">
              A list of all the units in your portfolio across all buildings.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/units/new"
              className="block rounded-md bg-[#781C21] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#61161a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#781C21]"
            >
              Add Unit
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-8 text-red-500">Error loading units: {error.message}</div>
        ) : (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow-sm ring-1 ring-slate-200/60 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:pl-6">
                          Building
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Apartment
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Floor
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Size (sqm)
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Rent
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Status
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {units?.map((unit) => (
                        <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                            <Link href={`/buildings/${unit.building_id}`} className="hover:underline">
                              {(unit.buildings as any).name}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                            <Link href={`/units/${unit.id}`} className="hover:underline">
                              {unit.apartment_number || 'N/A'}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                            {unit.floor || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                            {unit.size_sqm || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                            ${unit.rent_amount}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              unit.status === 'occupied'
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/50'
                                : 'bg-amber-50 text-amber-700 ring-amber-200/50'
                            }`}>
                              {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex justify-end gap-3">
                              <Link href={`/units/${unit.id}/edit`} className="text-slate-500 hover:text-slate-900">
                                Edit<span className="sr-only">, Unit on {unit.floor}</span>
                              </Link>
                              <form action={async () => {
                                'use server'
                                await deleteUnit(unit.id)
                              }}>
                                <button type="submit" className="text-red-500 hover:text-red-700">
                                  Delete
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {units?.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-sm text-slate-400">
                            No units found. Click 'Add Unit' to get started.
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
