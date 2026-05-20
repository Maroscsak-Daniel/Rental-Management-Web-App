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
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold tracking-tight text-white">Buildings</h1>
            <p className="mt-2 text-sm text-zinc-400">
              A list of all the buildings in your portfolio including their name, address, unit count, and creation date.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/buildings/new"
              className="block rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-black shadow-sm hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
                <div className="overflow-hidden shadow ring-1 ring-white/10 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-zinc-800">
                    <thead className="bg-zinc-900">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Address
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Units
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Created At
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
                      {buildings?.map((building) => (
                        <tr key={building.id} className="hover:bg-zinc-800/50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                            <Link href={`/buildings/${building.id}`} className="hover:underline">
                              {building.name}
                            </Link>
                          </td>
                          <td className="px-3 py-4 text-sm text-zinc-300 max-w-xs truncate">
                            {building.address}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-300">
                            {(building.units as any)?.[0]?.count || 0}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-300">
                            {new Date(building.created_at).toLocaleDateString()}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex justify-end gap-3">
                              <Link href={`/buildings/${building.id}/edit`} className="text-zinc-400 hover:text-white">
                                Edit<span className="sr-only">, {building.name}</span>
                              </Link>
                              <DeleteBuildingButton id={building.id} name={building.name} />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {buildings?.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-sm text-zinc-400">
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
