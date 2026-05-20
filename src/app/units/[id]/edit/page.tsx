'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { updateUnit } from '../../actions'
import { createClient } from '@/lib/supabase/client'

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
      // Load unit
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

      // Load buildings
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!unitData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center flex-col">
        <div className="text-white mb-4">Unit not found</div>
        <Link href="/units" className="text-blue-400 hover:underline">Return to units</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
              Edit Unit
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href={`/units/${id}`}
              className="inline-flex items-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700"
            >
              Cancel
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900/50 shadow-sm ring-1 ring-white/10 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="building_id" className="block text-sm font-medium leading-6 text-white">
                  Building
                </label>
                <div className="mt-2">
                  <select
                    id="building_id"
                    name="building_id"
                    defaultValue={unitData.building_id}
                    required
                    className="block w-full rounded-md border-0 bg-white/5 py-2 pl-3 pr-10 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6 [&>option]:text-black"
                  >
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="apartment_number" className="block text-sm font-medium leading-6 text-white">
                  Apartment number (optional)
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="apartment_number"
                    id="apartment_number"
                    defaultValue={unitData.apartment_number || ''}
                    autoComplete="off"
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-3 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                    placeholder="e.g. 12A, 304"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="floor" className="block text-sm font-medium leading-6 text-white">
                  Floor (optional)
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="floor"
                    id="floor"
                    defaultValue={unitData.floor || ''}
                    autoComplete="off"
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-3 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="size_sqm" className="block text-sm font-medium leading-6 text-white">
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
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-3 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="rent_amount" className="block text-sm font-medium leading-6 text-white">
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
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-3 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium leading-6 text-white">
                  Status
                </label>
                <div className="mt-2">
                  <select
                    id="status"
                    name="status"
                    defaultValue={unitData.status}
                    className="block w-full rounded-md border-0 bg-white/5 py-2 pl-3 pr-10 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6 [&>option]:text-black"
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
          
          <div className="flex items-center justify-end gap-x-6 border-t border-white/10 px-4 py-4 sm:px-8 bg-zinc-900/50">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
