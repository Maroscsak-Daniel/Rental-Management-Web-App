import { createClient } from '@/lib/supabase/server'
import { MaintenanceStatus } from '@/lib/definitions'
import { isValidMaintenanceTransition } from '@/lib/maintenance/state-machine'
import { resolveNotificationsByReference } from '@/lib/notifications/resolve'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'landlord') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { status?: MaintenanceStatus; resolution_notes?: string | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const status = body.status
  const resolution_notes = body.resolution_notes ?? null

  if (!status) {
    return NextResponse.json({ error: 'status is required' }, { status: 400 })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('maintenance_requests')
    .select('id, status')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: 'Maintenance request not found' },
      { status: 404 }
    )
  }

  const currentStatus = existing.status as MaintenanceStatus

  if (currentStatus === 'resolved') {
    return NextResponse.json(
      { error: 'Resolved requests cannot be updated' },
      { status: 422 }
    )
  }

  if (!isValidMaintenanceTransition(currentStatus, status)) {
    return NextResponse.json(
      {
        error: `Invalid status transition from "${currentStatus}" to "${status}"`,
      },
      { status: 422 }
    )
  }

  const updatePayload: {
    status: MaintenanceStatus
    resolution_notes?: string | null
    resolved_at?: string
  } = { status }

  if (status === 'resolved') {
    updatePayload.resolved_at = new Date().toISOString()
    updatePayload.resolution_notes = resolution_notes
  } else {
    updatePayload.resolution_notes = resolution_notes
  }

  const { data, error } = await supabase
    .from('maintenance_requests')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log a note entry whenever the user saves (with or without text)
  const noteText = resolution_notes?.trim()
  if (noteText) {
    await supabase.from('maintenance_notes').insert({
      maintenance_request_id: id,
      author_id: user.id,
      note: noteText,
      status_at_time: status,
    })
  }

  if (status === 'in_progress' || status === 'resolved') {
    await resolveNotificationsByReference({
      landlordId: user.id,
      type: 'maintenance_stale',
      referenceId: id,
    })
  }

  return NextResponse.json(data)
}
