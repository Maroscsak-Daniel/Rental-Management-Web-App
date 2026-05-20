import Navbar from '@/components/Navbar'
import OccupancyWidget from './components/OccupancyWidget'
import OutstandingPaymentsWidget from './components/OutstandingPaymentsWidget'
import OpenMaintenanceWidget from './components/OpenMaintenanceWidget'
import ExpiringLeasesWidget from './components/ExpiringLeasesWidget'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 md:pl-64">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <OccupancyWidget />
          <OutstandingPaymentsWidget />
          <OpenMaintenanceWidget />
          <ExpiringLeasesWidget />
        </div>
      </main>
    </div>
  )
}
