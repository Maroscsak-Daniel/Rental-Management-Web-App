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
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold tracking-tight text-white">Units</h1>
            <p className="mt-2 text-sm text-zinc-400">
              A list of all the units in your portfolio across all buildings.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/units/new"
              className="block rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-black shadow-sm hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
                <div className="overflow-hidden shadow ring-1 ring-white/10 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-zinc-800">
                    <thead className="bg-zinc-900">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">
                          Building
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Apartment
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Floor
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Size (sqm)
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Rent
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Status
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
                      {units?.map((unit) => (
                        <tr key={unit.id} className="hover:bg-zinc-800/50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                            <Link href={`/buildings/${unit.building_id}`} className="hover:underline">
                              {/* @ts-expect-error join type */}
                              {unit.buildings.name}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-300">
                            <Link href={`/units/${unit.id}`} className="hover:underline">
                              {unit.apartment_number || 'N/A'}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-300">
                            {unit.floor || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-300">
                            {unit.size_sqm || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-300">
                            ${unit.rent_amount}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              unit.status === 'occupied' 
                                ? 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' 
                                : 'bg-amber-400/10 text-amber-400 ring-amber-400/20'
                            }`}>
                              {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex justify-end gap-3">
                              <Link href={`/units/${unit.id}/edit`} className="text-zinc-400 hover:text-white">
                                Edit<span className="sr-only">, Unit on {unit.floor}</span>
                              </Link>
                              <form action={async () => {
                                'use server'
                                await deleteUnit(unit.id)
                              }}>
                                <button type="submit" className="text-red-400 hover:text-red-300">
                                  Delete
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {units?.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-sm text-zinc-400">
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
