'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { resolveNotificationsByReference } from '@/lib/notifications/resolve'

export async function createLease(formData: FormData) {
  const supabase = await createClient()

  const tenantId = formData.get('tenant_id') as string
  const unitId = formData.get('unit_id') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string
  const rentAmount = parseFloat(formData.get('rent_amount') as string)

  // Validation
  if (!tenantId || !unitId || !startDate || !endDate) {
    return { error: 'All fields are required.' }
  }

  if (isNaN(rentAmount) || rentAmount < 0) {
    return { error: 'Rent amount must be a valid positive number.' }
  }

  if (new Date(endDate) <= new Date(startDate)) {
    return { error: 'End date must be after start date.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify unit availability by checking for overlapping active leases
  const { data: activeLeasesForUnit, error: unitLeaseError } = await supabase
    .from('leases')
    .select('id, start_date, end_date')
    .eq('unit_id', unitId)
    .eq('status', 'active')

  if (unitLeaseError) {
    return { error: 'Failed to verify unit availability.' }
  }

  const newStart = new Date(startDate)
  const newEnd = new Date(endDate)

  if (activeLeasesForUnit) {
    for (const lease of activeLeasesForUnit) {
      const existingStart = new Date(lease.start_date)
      const existingEnd = new Date(lease.end_date)
      // Two date ranges overlap if (Start A < End B) and (End A > Start B)
      if (existingStart < newEnd && existingEnd > newStart) {
        return { error: 'This unit is already booked for the selected dates. Please choose different dates or a different unit.' }
      }
    }
  }

  // Verify tenant belongs to this landlord
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('id', tenantId)
    .single()

  if (tenantError || !tenant) {
    return { error: 'Invalid tenant selected.' }
  }

  // Check if tenant already has an active lease
  const { data: existingLease } = await supabase
    .from('leases')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .limit(1)

  if (existingLease && existingLease.length > 0) {
    return { error: 'This tenant already has an active lease. Terminate it first.' }
  }

  // Create lease
  const { error: leaseError } = await supabase.from('leases').insert({
    landlord_id: user.id,
    tenant_id: tenantId,
    unit_id: unitId,
    start_date: startDate,
    end_date: endDate,
    rent_amount: rentAmount,
    status: 'active',
  })

  if (leaseError) {
    return { error: leaseError.message }
  }

  // Set unit status to occupied
  await supabase.from('units').update({ status: 'occupied' }).eq('id', unitId)

  revalidatePath('/leases')
  revalidatePath('/tenants')
  revalidatePath(`/tenants/${tenantId}`)
  revalidatePath('/units')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateLease(id: string, formData: FormData) {
  const supabase = await createClient()

  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string
  const rentAmount = parseFloat(formData.get('rent_amount') as string)

  if (!startDate || !endDate) {
    return { error: 'Start and end dates are required.' }
  }

  if (isNaN(rentAmount) || rentAmount < 0) {
    return { error: 'Rent amount must be a valid positive number.' }
  }

  if (new Date(endDate) <= new Date(startDate)) {
    return { error: 'End date must be after start date.' }
  }

  // Auto-detect if lease should be expired
  const status = new Date(endDate) < new Date() ? 'expired' : undefined

  const updateData: Record<string, unknown> = {
    start_date: startDate,
    end_date: endDate,
    rent_amount: rentAmount,
  }

  if (status) {
    updateData.status = status
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('leases')
    .update(updateData)
    .eq('id', id)
    .eq('landlord_id', user.id)

  if (error) {
    return { error: error.message }
  }

  if (status === 'expired' && user) {
    await resolveNotificationsByReference({
      landlordId: user.id,
      type: 'lease_expiry',
      referenceId: id,
    })
  }

  // If lease auto-expired, free up the unit
  if (status === 'expired') {
    const { data: lease } = await supabase
      .from('leases')
      .select('unit_id')
      .eq('id', id)
      .single()
  // Fetch current lease to know unit_id and previous status
  const { data: currentLease, error: fetchError } = await supabase
    .from('leases')
    .select('unit_id, status')
    .eq('id', id)
    .single()

  if (fetchError || !currentLease) {
    return { error: 'Lease not found.' }
  }

  // Derive status from end date: past → expired, future → active
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDateObj = new Date(endDate)
  endDateObj.setHours(0, 0, 0, 0)
  const newStatus = endDateObj < today ? 'expired' : 'active'

  const { error } = await supabase
    .from('leases')
    .update({ start_date: startDate, end_date: endDate, rent_amount: rentAmount, status: newStatus })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  // Sync unit occupancy when status changes
  const wasActive = currentLease.status === 'active'
  const isNowActive = newStatus === 'active'
  if (!wasActive && isNowActive) {
    await supabase.from('units').update({ status: 'occupied' }).eq('id', currentLease.unit_id)
  } else if (wasActive && !isNowActive) {
    await supabase.from('units').update({ status: 'vacant' }).eq('id', currentLease.unit_id)
  }

  revalidatePath('/leases')
  revalidatePath('/tenants')
  revalidatePath(`/leases/${id}`)
  return { success: true }
}

export async function terminateLease(id: string) {
  const supabase = await createClient()

  // Get lease details first
  const { data: lease, error: fetchError } = await supabase
    .from('leases')
    .select('unit_id, tenant_id, status')
    .eq('id', id)
    .single()

  if (fetchError || !lease) {
    return { error: 'Lease not found.' }
  }

  if (lease.status !== 'active') {
    return { error: 'Only active leases can be terminated.' }
  }

  // Set lease to terminated
  const { error } = await supabase
    .from('leases')
    .update({ status: 'terminated' })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await resolveNotificationsByReference({
    landlordId: user.id,
    type: 'lease_expiry',
    referenceId: id,
  })

  // Set unit back to vacant
  await supabase.from('units').update({ status: 'vacant' }).eq('id', lease.unit_id)

  revalidatePath('/leases')
  revalidatePath(`/leases/${id}`)
  revalidatePath('/tenants')
  revalidatePath(`/tenants/${lease.tenant_id}`)
  revalidatePath('/units')
  revalidatePath('/dashboard')
  return { success: true }
}
