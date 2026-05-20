import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteUnit } from '../actions'
import { formatUnitLabel } from '@/lib/display'

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: unit, error } = await supabase
    .from('units')
    .select('*, buildings!inner(id, name)')
    .eq('id', id)
    .single()

  if (error || !unit) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8 border-b border-zinc-800 pb-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
              Unit Detail: {formatUnitLabel(unit as any)}
            </h2>
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-zinc-400">
                Added {new Date(unit.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
            <Link
              href={`/units/${unit.id}/edit`}
              className="inline-flex items-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700"
            >
              Edit
            </Link>
            <form action={async () => {
              'use server'
              await deleteUnit(unit.id)
            }}>
              <button type="submit" className="inline-flex items-center rounded-md bg-red-900/50 border border-red-500/20 px-3 py-2 text-sm font-semibold text-red-400 shadow-sm hover:bg-red-900/70">
                Delete
              </button>
            </form>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-sm backdrop-blur-xl">
          <div className="px-4 py-6 sm:p-8">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-zinc-400">Building</dt>
                <dd className="mt-1 text-sm text-white">
                  <Link href={`/buildings/${(unit.buildings as any).id}`} className="hover:underline">
                    {(unit.buildings as any).name}
                  </Link>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-zinc-400">Status</dt>
                <dd className="mt-1 text-sm text-white">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    unit.status === 'occupied' 
                      ? 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' 
                      : 'bg-amber-400/10 text-amber-400 ring-amber-400/20'
                  }`}>
                    {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-zinc-400">Apartment number</dt>
                <dd className="mt-1 text-sm text-white">{unit.apartment_number || 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-zinc-400">Floor</dt>
                <dd className="mt-1 text-sm text-white">{unit.floor || 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-zinc-400">Size</dt>
                <dd className="mt-1 text-sm text-white">{unit.size_sqm ? `${unit.size_sqm} sqm` : 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-zinc-400">Rent Amount</dt>
                <dd className="mt-1 text-sm text-white">${unit.rent_amount}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  )
}
