import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DeleteBuildingButton from '@/components/DeleteBuildingButton'

export default async function BuildingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: building, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !building) notFound()

  const { data: units } = await supabase
    .from('units')
    .select('id, floor, apartment_number, size_sqm, rent_amount, status')
    .eq('building_id', id)
    .order('apartment_number', { ascending: true })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8 border-b border-slate-200 pb-5">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{building.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{building.address}</p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
            <Link
              href={`/buildings/${id}/edit`}
              className="inline-flex items-center rounded-md bg-white border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Edit
            </Link>
            <DeleteBuildingButton id={id} name={building.name} />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm mb-6">
          <div className="px-4 py-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Details</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-slate-500">Name</dt>
                <dd className="mt-1 text-sm text-slate-900">{building.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Address</dt>
                <dd className="mt-1 text-sm text-slate-900">{building.address}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Created</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {new Date(building.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Total Units</dt>
                <dd className="mt-1 text-sm text-slate-900">{units?.length ?? 0}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Units</h2>
            <Link
              href={`/units/new?building=${id}`}
              className="rounded-md bg-[#781C21] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#61161a]"
            >
              Add Unit
            </Link>
          </div>
          {units && units.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:pl-6">Unit</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Size</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rent</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="relative py-3 pl-3 pr-4 sm:pr-6"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-3.5 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                      {unit.apartment_number ? `Apt ${unit.apartment_number}` : unit.floor ? `Floor ${unit.floor}` : '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-sm text-slate-500">
                      {unit.size_sqm ? `${unit.size_sqm} m²` : '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-sm text-slate-500">
                      ${Number(unit.rent_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          unit.status === 'occupied'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/50'
                            : 'bg-slate-100 text-slate-500 ring-slate-200/50'
                        }`}
                      >
                        {unit.status === 'occupied' ? 'Occupied' : 'Vacant'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3.5 pl-3 pr-4 text-right text-sm sm:pr-6">
                      <Link href={`/units/${unit.id}`} className="text-slate-500 hover:text-slate-900 font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-sm text-slate-400">
              No units yet.{' '}
              <Link href={`/units/new?building=${id}`} className="text-[#781C21] hover:underline font-medium">
                Add the first unit
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
