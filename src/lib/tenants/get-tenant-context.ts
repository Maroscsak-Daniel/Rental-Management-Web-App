import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface TenantContext {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  tenantId: string
  profile: {
    role: string
    tenant_id: string
  }
}

/**
 * Resolves the current authenticated user to a tenant context.
 *
 * Flow: auth.getUser() → profiles (role + tenant_id) → validate tenant
 *
 * Redirects to /login if not authenticated, /unauthorized if not a tenant.
 */
export async function getTenantContext(): Promise<TenantContext> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (error || !profile || profile.role !== 'tenant' || !profile.tenant_id) {
    redirect('/unauthorized')
  }

  return {
    supabase,
    userId: user.id,
    tenantId: profile.tenant_id,
    profile: profile as { role: string; tenant_id: string },
  }
}
