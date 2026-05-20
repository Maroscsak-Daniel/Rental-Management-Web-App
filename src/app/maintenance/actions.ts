'use server'

import { createClient } from '@/lib/supabase/server'
import { MaintenanceStatus } from '@/lib/definitions'
import {
  getAllowedNextStatuses,
  isValidMaintenanceTransition,
} from '@/lib/maintenance/state-machine'
import { revalidatePath } from 'next/cache'
import { resolveNotificationsByReference } from '@/lib/notifications/resolve'

export type MaintenanceActionResult =
  | { success: true }
  | { error: string; status?: number }

export async function createMaintenanceRequest(
  formData: FormData
): Promise<MaintenanceActionResult> {
  const supabase = await createClient()
  const unit_id = formData.get('unit_id') as string
  const description = (formData.get('description') as string)?.trim()

  if (!unit_id) return { error: 'Please select a unit.' }
  if (!description) return { error: 'Description is required.' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated', status: 401 }

  const { data: unit, error: unitError } = await supabase
    .from('units')
    .select('id, buildings!inner(landlord_id)')
    .eq('id', unit_id)
    .single()

  if (unitError || !unit) {
    return { error: 'Invalid unit or you do not have permission.' }
  }

  if ((unit.buildings as any).landlord_id !== user.id) {
    return { error: 'Invalid unit or you do not have permission.' }
  }

  const { error } = await supabase.from('maintenance_requests').insert({
    unit_id,
    description,
    submitted_by_tenant_id: null,
  })

  if (error) return { error: error.message }

  revalidatePath('/maintenance')
  return { success: true }
}

export async function updateMaintenanceRequest(
  id: string,
  formData: FormData
): Promise<MaintenanceActionResult> {
  const supabase = await createClient()
  const status = formData.get('status') as MaintenanceStatus
  const resolution_notes =
    (formData.get('resolution_notes') as string | null)?.trim() || null

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated', status: 401 }

  const { data: existing, error: fetchError } = await supabase
    .from('maintenance_requests')
    .select('id, status, resolution_notes, unit_id')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return { error: 'Maintenance request not found.', status: 404 }
  }

  const currentStatus = existing.status as MaintenanceStatus

  if (!isValidMaintenanceTransition(currentStatus, status)) {
    return {
      error: `Invalid status transition from "${currentStatus}" to "${status}".`,
      status: 422,
    }
  }

  const updatePayload: {
    status: MaintenanceStatus
    resolution_notes?: string | null
    resolved_at?: string | null
  } = { status }

  if (currentStatus === 'resolved') {
    return {
      error: 'Resolved requests cannot be updated.',
      status: 422,
    }
  }

  if (status === 'resolved') {
    updatePayload.resolved_at = new Date().toISOString()
    updatePayload.resolution_notes = resolution_notes
  } else {
    updatePayload.resolution_notes = resolution_notes
  }

  const { error } = await supabase
    .from('maintenance_requests')
    .update(updatePayload)
    .eq('id', id)

  if (error) return { error: error.message }

  if (status === 'in_progress' || status === 'resolved') {
    await resolveNotificationsByReference({
      landlordId: user.id,
      type: 'maintenance_stale',
      referenceId: id,
    })
  }

  revalidatePath('/maintenance')
  revalidatePath(`/maintenance/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export { getAllowedNextStatuses }
