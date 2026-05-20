import type { Metadata } from 'next'
import TenantNav from './components/TenantNav'

export const metadata: Metadata = {
  title: 'Tenant Portal — Rental Management',
  description: 'View your lease, invoices, and submit maintenance requests.',
}

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <TenantNav />
      <main className="md:ml-64 min-h-screen">{children}</main>
    </div>
  )
}
