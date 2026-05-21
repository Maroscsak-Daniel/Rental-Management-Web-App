import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import DeleteBuildingButton from '@/components/DeleteBuildingButton'

export default async function BuildingsPage() {
  const supabase = await createClient()

  const { data: buildings, error } = await supabase
    .from('buildings')
    .select('*, units(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Buildings</h1>
            <p className="mt-2 text-sm text-slate-500">
              A list of all the buildings in your portfolio including their name, address, unit count, and creation date.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/buildings/new"
              className="block rounded-md bg-[#781C21] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#61161a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#781C21]"
            >
              Add Building
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-8 text-red-500">Error loading buildings: {error.message}</div>
        ) : (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow-sm ring-1 ring-slate-200/60 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:pl-6">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Address
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Units
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Created At
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {buildings?.map((building) => (
                        <tr key={building.id} className="hover:bg-slate-50 transition-colors">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                            <Link href={`/buildings/${building.id}`} className="hover:underline">
                              {building.name}
                            </Link>
                          </td>
                          <td className="px-3 py-4 text-sm text-slate-500 max-w-xs truncate">
                            {building.address}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                            {building.units[0]?.count || 0}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                            {new Date(building.created_at).toLocaleDateString()}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex justify-end gap-3">
                              <Link href={`/buildings/${building.id}/edit`} className="text-slate-500 hover:text-slate-900">
                                Edit<span className="sr-only">, {building.name}</span>
                              </Link>
                              <DeleteBuildingButton id={building.id} name={building.name} />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {buildings?.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                            No buildings found. Click 'Add Building' to get started.
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
