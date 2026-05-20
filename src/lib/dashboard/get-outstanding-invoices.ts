import { createClient } from '@/lib/supabase/server'
import { formatUnitLabel } from '@/lib/display'

export type OutstandingInvoiceRow = {
  id: string
  amount: number
  due_date: string
  status: string
  category: string
  tenantName: string
  unitLabel: string
}

function currentMonthBounds(): { start: string; end: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const lastDay = new Date(year, month, 0).getDate()
  const mm = String(month).padStart(2, '0')
  return {
    start: `${year}-${mm}-01`,
    end: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  }
}

export async function getOutstandingInvoices(): Promise<{
  data: OutstandingInvoiceRow[]
  error: string | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: 'Not authenticated' }
  }

  const { start, end } = currentMonthBounds()

  const { data, error } = await supabase
    .from('invoices')
    .select(
      `
      id,
      amount,
      due_date,
      status,
      category,
      tenants:tenant_id ( first_name, last_name ),
      leases:lease_id (
        units (
          floor,
          apartment_number,
          buildings ( name )
        )
      )
    `
    )
    .eq('landlord_id', user.id)
    .in('status', ['pending', 'overdue'])
    .gte('due_date', start)
    .lte('due_date', end)
    .order('due_date', { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  const rows: OutstandingInvoiceRow[] = (data ?? []).map((inv) => {
    const tenantRaw = inv.tenants
    const tenant = (Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw) as
      | { first_name: string; last_name: string }
      | null
    const leaseRaw = inv.leases
    const lease = Array.isArray(leaseRaw) ? leaseRaw[0] : leaseRaw
    const unitRaw = lease?.units
    const unitRow = Array.isArray(unitRaw) ? unitRaw[0] : unitRaw
    const buildingsRaw = unitRow?.buildings
    const buildings = Array.isArray(buildingsRaw) ? buildingsRaw[0] : buildingsRaw
    const unit = unitRow
      ? {
          floor: (unitRow.floor as string | null) ?? null,
          apartment_number: (unitRow.apartment_number as string | null) ?? null,
          buildings: buildings
            ? { name: (buildings.name as string) ?? 'Unknown' }
            : null,
        }
      : null

    return {
      id: inv.id,
      amount: Number(inv.amount),
      due_date: inv.due_date,
      status: inv.status,
      category: inv.category,
      tenantName: tenant
        ? `${tenant.first_name} ${tenant.last_name}`
        : 'Unknown tenant',
      unitLabel: unit
        ? formatUnitLabel({
            floor: unit.floor,
            apartment_number: unit.apartment_number,
            buildings: unit.buildings ?? undefined,
          })
        : 'No unit linked',
    }
  })

  return { data: rows, error: null }
}
