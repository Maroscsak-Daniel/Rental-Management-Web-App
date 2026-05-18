import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch summary stats
  const { count: buildingsCount } = await supabase
    .from('buildings')
    .select('*', { count: 'exact', head: true })

  const { count: unitsCount } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })

  const { count: occupiedCount } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'occupied')

  const { count: vacantCount } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'vacant')

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-xl transition-all hover:bg-zinc-900">
            <dt className="truncate text-sm font-medium text-zinc-400">Total Buildings</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight text-white">{buildingsCount || 0}</dd>
          </div>

          {/* Card 2 */}
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-xl transition-all hover:bg-zinc-900">
            <dt className="truncate text-sm font-medium text-zinc-400">Total Units</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight text-white">{unitsCount || 0}</dd>
          </div>

          {/* Card 3 */}
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-xl transition-all hover:bg-zinc-900">
            <dt className="truncate text-sm font-medium text-zinc-400">Occupied Units</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight text-emerald-400">{occupiedCount || 0}</dd>
          </div>

          {/* Card 4 */}
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm backdrop-blur-xl transition-all hover:bg-zinc-900">
            <dt className="truncate text-sm font-medium text-zinc-400">Vacant Units</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight text-amber-400">{vacantCount || 0}</dd>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link href="/buildings" className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm transition-all hover:border-zinc-700">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
            <h3 className="text-xl font-bold text-white mb-2">Manage Buildings →</h3>
            <p className="text-zinc-400 text-sm">View, add, edit, or remove buildings from your portfolio.</p>
          </Link>

          <Link href="/units" className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm transition-all hover:border-zinc-700">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
            <h3 className="text-xl font-bold text-white mb-2">Manage Units →</h3>
            <p className="text-zinc-400 text-sm">Update unit statuses, set rent amounts, and assign floors.</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
