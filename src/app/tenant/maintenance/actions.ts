'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type TenantMaintenanceResult =
  | { success: true }
  | { error: string }

export interface TenantMaintenanceRequest {
  id: string
  description: string
  status: string
  created_at: string
  units: {
    apartment_number: string | null
    floor: string | null
    buildings: {
      name: string
    }
  } | null
}

/**
 * Fetch all maintenance requests submitted by this tenant.
 * Scoped via profiles.tenant_id → maintenance_requests.submitted_by_tenant_id.
 */
export async function getTenantMaintenanceRequests(): Promise<{
  data: TenantMaintenanceRequest[]
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: 'Not authenticated' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.tenant_id || profile.role !== 'tenant') {
    return { data: [], error: 'Only tenant accounts can view maintenance requests.' }
  }

  const { data: requests, error } = await supabase
    .from('maintenance_requests')
    .select(`
      id,
      description,
      status,
      created_at,
      units:unit_id (
        apartment_number,
        floor,
        buildings:building_id (
          name
        )
      )
    `)
    .eq('submitted_by_tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (requests as unknown as TenantMaintenanceRequest[]) ?? [], error: null }
}

export async function submitTenantMaintenanceRequest(
  formData: FormData
): Promise<TenantMaintenanceResult> {
  const supabase = await createClient()
  const description = (formData.get('description') as string)?.trim()

  if (!description) {
    return { error: 'Description is required.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.tenant_id || profile.role !== 'tenant') {
    return { error: 'Only tenant accounts can submit maintenance requests.' }
  }

  const { data: activeLease, error: leaseError } = await supabase
    .from('leases')
    .select('id, unit_id')
    .eq('tenant_id', profile.tenant_id)
    .eq('status', 'active')
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (leaseError) {
    return { error: leaseError.message }
  }

  if (!activeLease) {
    return {
      error:
        'You do not have an active lease. Maintenance requests can only be submitted while your lease is active.',
    }
  }

  const { error } = await supabase.from('maintenance_requests').insert({
    unit_id: activeLease.unit_id,
    submitted_by_tenant_id: profile.tenant_id,
    description,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/tenant/maintenance')
  return { success: true }
}
