import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TenantPortalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the tenant profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'tenant') {
    redirect('/unauthorized')
  }

  let tenantData = null
  if (profile?.tenant_id) {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('first_name, last_name')
      .eq('id', profile.tenant_id)
      .single()
    tenantData = tenant
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl bg-white p-8 shadow-sm rounded-xl border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Welcome to the Tenant Portal
        </h1>
        {tenantData ? (
          <p className="text-slate-600 mb-8">
            Hello, {tenantData.first_name} {tenantData.last_name}! This portal is under construction.
          </p>
        ) : (
          <p className="text-slate-600 mb-8">
            Hello! This portal is under construction.
          </p>
        )}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-blue-800">
          <h2 className="text-lg font-semibold mb-2">Coming Soon in Phase 5</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>View your active lease details</li>
            <li>Submit and track maintenance requests</li>
            <li>Make rent payments online</li>
            <li>View landlord announcements</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
