'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createBuilding } from '../actions'

export default function NewBuildingPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createBuilding(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/buildings')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
              Add New Building
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/buildings"
              className="inline-flex items-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700"
            >
              Cancel
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-zinc-900/50 shadow-sm ring-1 ring-white/10 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium leading-6 text-white">
                  Building Name
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-white">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="off"
                      className="flex-1 border-0 bg-transparent py-1.5 pl-3 text-white focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Sunset Towers"
                      required
                    />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">Must be unique across your properties.</p>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="address" className="block text-sm font-medium leading-6 text-white">
                  Address
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-white">
                    <input
                      type="text"
                      name="address"
                      id="address"
                      autoComplete="street-address"
                      className="flex-1 border-0 bg-transparent py-1.5 pl-3 text-white focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Str. Unirii, Nr. 1, City Cluj-Napoca"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-white/10 px-4 py-4 sm:px-8 bg-zinc-900/50">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Building'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
