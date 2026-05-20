import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteUnit } from '@/app/units/actions'
import DeleteBuildingButton from '@/components/DeleteBuildingButton'
import type { Unit } from '@/lib/definitions'

export default async function BuildingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: building, error } = await supabase
    .from('buildings')
    .select('*, units(*)')
    .eq('id', id)
    .single()

  if (error || !building) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8 border-b border-zinc-800 pb-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
              {building.name}
            </h2>
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-zinc-400">
                {building.address}
              </div>
              <div className="mt-2 flex items-center text-sm text-zinc-400">
                Added {new Date(building.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
            <Link
              href={`/buildings/${building.id}/edit`}
              className="inline-flex items-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700"
            >
              Edit
            </Link>
            {building.units.length === 0 && (
              <DeleteBuildingButton id={building.id} isDetail={true} />
            )}
          </div>
        </div>

        <div className="mt-10 sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-xl font-bold tracking-tight text-white">Units</h3>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href={`/units/new?building=${building.id}`}
              className="block rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-black shadow-sm hover:bg-zinc-200"
            >
              Add Unit
            </Link>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-white/10 sm:rounded-lg">
                <table className="min-w-full divide-y divide-zinc-800">
                  <thead className="bg-zinc-900">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">
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
                    {(building.units as Unit[]).map((unit) => (
                      <tr key={unit.id} className="hover:bg-zinc-800/50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
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
                    {building.units.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm text-zinc-400">
                          No units found in this building. Click 'Add Unit' to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
