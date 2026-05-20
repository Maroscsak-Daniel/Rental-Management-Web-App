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
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
              New Maintenance Request
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/maintenance"
              className="inline-flex items-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700"
            >
              Cancel
            </Link>
          </div>
        </div>

        {fetchingUnits ? (
          <div className="text-white text-center py-10">Loading...</div>
        ) : units.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-white mb-4">
              You need at least one unit before creating a request.
            </h3>
            <Link href="/units/new" className="text-[#617891] hover:underline">
              Add a unit
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900/50 shadow-sm ring-1 ring-white/10 sm:rounded-xl"
          >
            <div className="px-4 py-6 sm:p-8 space-y-6">
              <div>
                <label
                  htmlFor="unit_id"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Unit
                </label>
                <div className="mt-2">
                  <select
                    id="unit_id"
                    name="unit_id"
                    required
                    defaultValue={units[0].id}
                    className="block w-full rounded-md border-0 bg-white/5 py-2 pl-3 pr-10 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm [&>option]:text-black"
                  >
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.buildings.name} — Floor {unit.floor || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Description
                </label>
                <div className="mt-2">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    className="block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm"
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

            <div className="flex items-center justify-end gap-x-6 border-t border-white/10 px-4 py-4 sm:px-8 bg-zinc-900/50">
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-zinc-200 disabled:opacity-50"
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
