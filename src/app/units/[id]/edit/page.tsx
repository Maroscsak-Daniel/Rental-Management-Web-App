'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { updateUnit } from '../../actions'
import { createClient } from '@/lib/supabase/client'

const inputClass = 'block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#25344F] focus:outline-none focus:ring-1 focus:ring-[#25344F] sm:text-sm'
const selectClass = 'block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#25344F] focus:outline-none focus:ring-1 focus:ring-[#25344F] sm:text-sm'

export default function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [buildings, setBuildings] = useState<{id: string, name: string}[]>([])
  const [unitData, setUnitData] = useState<any>(null)
  const [fetching, setFetching] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: unitRes, error: unitErr } = await supabase
        .from('units')
        .select('*')
        .eq('id', id)
        .single()

      if (unitErr || !unitRes) {
        setError('Failed to load unit data')
        setFetching(false)
        return
      }

      setUnitData(unitRes)

      const { data: buildingsRes, error: bldErr } = await supabase
        .from('buildings')
        .select('id, name')
        .order('name')

      if (!bldErr && buildingsRes) {
        setBuildings(buildingsRes)
      }

      setFetching(false)
    }

    loadData()
  }, [id, supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateUnit(id, formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/units/${id}`)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  if (!unitData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col">
        <div className="text-slate-700 mb-4">Unit not found</div>
        <Link href="/units" className="text-[#781C21] hover:underline">Return to units</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Edit Unit
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href={`/units/${id}`}
              className="inline-flex items-center rounded-md bg-white border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-slate-200/60 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="building_id" className="block text-sm font-medium leading-6 text-slate-700">
                  Building
                </label>
                <div className="mt-2">
                  <select
                    id="building_id"
                    name="building_id"
                    defaultValue={unitData.building_id}
                    required
                    className={selectClass}
                  >
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="apartment_number" className="block text-sm font-medium leading-6 text-slate-700">
                  Apartment number (optional)
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="apartment_number"
                    id="apartment_number"
                    defaultValue={unitData.apartment_number || ''}
                    autoComplete="off"
                    className={inputClass}
                    placeholder="e.g. 12A, 304"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="floor" className="block text-sm font-medium leading-6 text-slate-700">
                  Floor (optional)
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="floor"
                    id="floor"
                    defaultValue={unitData.floor || ''}
                    autoComplete="off"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="size_sqm" className="block text-sm font-medium leading-6 text-slate-700">
                  Size in sqm (optional)
                </label>
                <div className="mt-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="size_sqm"
                    id="size_sqm"
                    defaultValue={unitData.size_sqm || ''}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="rent_amount" className="block text-sm font-medium leading-6 text-slate-700">
                  Rent Amount (required)
                </label>
                <div className="mt-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="rent_amount"
                    id="rent_amount"
                    defaultValue={unitData.rent_amount}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium leading-6 text-slate-700">
                  Status
                </label>
                <div className="mt-2">
                  <select
                    id="status"
                    name="status"
                    defaultValue={unitData.status}
                    className={selectClass}
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 sm:px-8">
              <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                {error}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-x-6 border-t border-slate-200 px-4 py-4 sm:px-8 bg-slate-50 rounded-b-xl">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[#781C21] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#61161a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#781C21] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
