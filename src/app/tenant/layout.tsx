import type { Metadata } from 'next'
import TenantNav from './components/TenantNav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Tenant Portal — Rental Management',
  description: 'View your lease, invoices, and submit maintenance requests.',
}

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'tenant') {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TenantNav />
      <main className="md:ml-64 min-h-screen">{children}</main>
    </div>
  )
}
