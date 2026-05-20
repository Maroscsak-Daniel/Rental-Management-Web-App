import { createClient } from '@/lib/supabase/server'
import { ExpiringLease, Lease } from '@/lib/definitions'

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function computeDaysRemaining(endDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(endDate + 'T00:00:00')
  const diffMs = end.getTime() - today.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

type LeaseRow = Lease & {
  units: {
    id: string
    floor: string | null
    apartment_number: string | null
    buildings: { id: string; name: string }
  }
  tenants: {
    id: string
    first_name: string
    last_name: string
  }
}

/**
 * F4: Active leases for the logged-in landlord expiring within 30 days.
 * Scoped via leases.landlord_id (matches Phase 2 RLS).
 */
export async function getExpiringLeases(): Promise<{
  data: ExpiringLease[]
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: 'Not authenticated' }
  }

  const today = new Date()
  const in30Days = new Date(today)
  in30Days.setDate(in30Days.getDate() + 30)

  const todayStr = toDateString(today)
  const in30Str = toDateString(in30Days)

  const { data, error } = await supabase
    .from('leases')
    .select(
      `
      *,
      units!inner (
        id,
        floor,
        apartment_number,
        buildings!inner (id, name)
      ),
      tenants!inner (
        id,
        first_name,
        last_name
      )
    `
    )
    .eq('landlord_id', user.id)
    .eq('status', 'active')
    .gte('end_date', todayStr)
    .lte('end_date', in30Str)
    .order('end_date', { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  const expiring: ExpiringLease[] = ((data ?? []) as LeaseRow[]).map((row) => ({
    id: row.id,
    landlord_id: row.landlord_id,
    unit_id: row.unit_id,
    tenant_id: row.tenant_id,
    start_date: row.start_date,
    end_date: row.end_date,
    rent_amount: row.rent_amount,
    status: row.status,
    created_at: row.created_at,
    days_remaining: computeDaysRemaining(row.end_date),
    unit: {
      id: row.units.id,
      floor: row.units.floor,
      apartment_number: row.units.apartment_number,
      buildings: {
        id: row.units.buildings.id,
        name: row.units.buildings.name,
      },
    },
    tenant: {
      id: row.tenants.id,
      first_name: row.tenants.first_name,
      last_name: row.tenants.last_name,
    },
  }))

  return { data: expiring, error: null }
}
