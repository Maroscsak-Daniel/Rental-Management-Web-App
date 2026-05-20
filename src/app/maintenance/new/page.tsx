'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createMaintenanceRequest } from '../actions'
import { createClient } from '@/lib/supabase/client'

type UnitOption = {
  id: string
  floor: string | null
  buildings: { name: string }
}

export default function NewMaintenancePage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [units, setUnits] = useState<UnitOption[]>([])
  const [fetchingUnits, setFetchingUnits] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUnits() {
      const { data } = await supabase
        .from('units')
        .select('id, floor, buildings!inner(name)')
        .order('floor')

      if (data) {
        setUnits(data as unknown as UnitOption[])
      }
      setFetchingUnits(false)
    }
    loadUnits()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createMaintenanceRequest(formData)

    if (result && 'error' in result && result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/maintenance')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
              New Maintenance Request
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/maintenance"
              className="inline-flex items-center rounded-md bg-white border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </div>

        {fetchingUnits ? (
          <div className="text-slate-500 text-center py-10">Loading...</div>
        ) : units.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-slate-700 mb-4">
              You need at least one unit before creating a request.
            </h3>
            <Link href="/units/new" className="text-[#617891] hover:underline">
              Add a unit
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-sm ring-1 ring-slate-200/60 sm:rounded-xl"
          >
            <div className="px-4 py-6 sm:p-8 space-y-6">
              <div>
                <label
                  htmlFor="unit_id"
                  className="block text-sm font-medium leading-6 text-slate-700"
                >
                  Unit
                </label>
                <div className="mt-2">
                  <select
                    id="unit_id"
                    name="unit_id"
                    required
                    defaultValue={units[0].id}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-[#25344F] focus:outline-none focus:ring-1 focus:ring-[#25344F] sm:text-sm"
                  >
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.buildings.name} â€” Floor {unit.floor || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium leading-6 text-slate-700"
                >
                  Description
                </label>
                <div className="mt-2">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#25344F] focus:outline-none focus:ring-1 focus:ring-[#25344F] sm:text-sm"
                    placeholder="Describe the maintenance issue..."
                  />
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
                className="rounded-md bg-[#781C21] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#61161a] disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
