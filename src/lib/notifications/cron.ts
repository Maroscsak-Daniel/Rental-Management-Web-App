import type { SupabaseClient } from '@supabase/supabase-js'
import { NotificationType } from '@/lib/definitions'

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

async function unreadExists(
  supabase: SupabaseClient,
  landlordId: string,
  type: NotificationType,
  referenceId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('notifications')
    .select('id')
    .eq('landlord_id', landlordId)
    .eq('type', type)
    .eq('reference_id', referenceId)
    .eq('is_read', false)
    .limit(1)

  return (data?.length ?? 0) > 0
}

async function insertNotification(
  supabase: SupabaseClient,
  landlordId: string,
  type: NotificationType,
  referenceId: string,
  message: string
): Promise<boolean> {
  if (await unreadExists(supabase, landlordId, type, referenceId)) {
    return false
  }

  const { error } = await supabase.from('notifications').insert({
    landlord_id: landlordId,
    type,
    reference_id: referenceId,
    message,
  })

  return !error
}

export async function runNotificationCron(
  supabase: SupabaseClient
): Promise<{
  landlordsProcessed: number
  created: { lease_expiry: number; payment_overdue: number; maintenance_stale: number }
}> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in30Days = new Date(today)
  in30Days.setDate(in30Days.getDate() + 30)
  const staleBefore = new Date(today)
  staleBefore.setDate(staleBefore.getDate() - 7)

  const todayStr = toDateString(today)
  const in30Str = toDateString(in30Days)
  const staleBeforeStr = toDateString(staleBefore)

  const { data: landlords, error: landlordsError } = await supabase
    .from('buildings')
    .select('landlord_id')

  if (landlordsError || !landlords) {
    throw new Error(landlordsError?.message ?? 'Failed to fetch landlords')
  }

  const landlordIds = [...new Set(landlords.map((b) => b.landlord_id))]
  const created = { lease_expiry: 0, payment_overdue: 0, maintenance_stale: 0 }

  for (const landlordId of landlordIds) {
    const { data: expiringLeases } = await supabase
      .from('leases')
      .select('id, end_date, tenants(first_name, last_name)')
      .eq('landlord_id', landlordId)
      .eq('status', 'active')
      .gte('end_date', todayStr)
      .lte('end_date', in30Str)

    for (const lease of expiringLeases ?? []) {
      const tenantRaw = lease.tenants
      const tenant = (Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw) as
        | { first_name: string; last_name: string }
        | null
      const name = tenant
        ? `${tenant.first_name} ${tenant.last_name}`
        : 'Tenant'
      const message = `Lease for ${name} expires on ${new Date(lease.end_date + 'T00:00:00').toLocaleDateString()}`
      if (
        await insertNotification(
          supabase,
          landlordId,
          'lease_expiry',
          lease.id,
          message
        )
      ) {
        created.lease_expiry++
      }
    }

    const { data: overdueInvoices } = await supabase
      .from('invoices')
      .select('id, amount, due_date, tenants(first_name, last_name)')
      .eq('landlord_id', landlordId)
      .eq('status', 'overdue')

    for (const invoice of overdueInvoices ?? []) {
      const tenantRaw = invoice.tenants
      const tenant = (Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw) as
        | { first_name: string; last_name: string }
        | null
      const name = tenant
        ? `${tenant.first_name} ${tenant.last_name}`
        : 'Tenant'
      const message = `Overdue invoice for ${name}: $${invoice.amount} (due ${new Date(invoice.due_date + 'T00:00:00').toLocaleDateString()})`
      if (
        await insertNotification(
          supabase,
          landlordId,
          'payment_overdue',
          invoice.id,
          message
        )
      ) {
        created.payment_overdue++
      }
    }

    const { data: staleMaintenance } = await supabase
      .from('maintenance_requests')
      .select(
        `
        id,
        description,
        units!inner (
          buildings!inner ( landlord_id )
        )
      `
      )
      .eq('status', 'open')
      .lt('reported_at', staleBeforeStr)
      .eq('units.buildings.landlord_id', landlordId)

    for (const req of staleMaintenance ?? []) {
      const preview =
        req.description.length > 60
          ? `${req.description.slice(0, 60)}…`
          : req.description
      const message = `Maintenance request open 7+ days: ${preview}`
      if (
        await insertNotification(
          supabase,
          landlordId,
          'maintenance_stale',
          req.id,
          message
        )
      ) {
        created.maintenance_stale++
      }
    }
  }

  return { landlordsProcessed: landlordIds.length, created }
}
