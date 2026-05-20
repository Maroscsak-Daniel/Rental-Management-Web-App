import { createClient } from '@/lib/supabase/server'
import { MaintenanceStatus } from '@/lib/definitions'
import { computeDaysOpen, isOverdueOpenRequest } from '@/lib/maintenance/days-open'
import { formatUnitLabel } from '@/lib/display'

export type OpenMaintenanceRow = {
  id: string
  description: string
  status: MaintenanceStatus
  reported_at: string
  daysOpen: number
  isStale: boolean
  unitLabel: string
}

export async function getOpenMaintenance(): Promise<{
  data: OpenMaintenanceRow[]
  error: string | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(
      `
      id,
      description,
      status,
      reported_at,
      resolved_at,
      units!inner (
        floor,
        apartment_number,
        buildings!inner ( name, landlord_id )
      )
    `
    )
    .eq('units.buildings.landlord_id', user.id)
    .in('status', ['open', 'in_progress'])
    .order('reported_at', { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  const rows: OpenMaintenanceRow[] = (data ?? []).map((req) => {
    const unitRaw = req.units
    const unitRow = Array.isArray(unitRaw) ? unitRaw[0] : unitRaw
    const buildingsRaw = unitRow?.buildings
    const buildings = Array.isArray(buildingsRaw) ? buildingsRaw[0] : buildingsRaw
    const unit = {
      floor: (unitRow?.floor as string | null) ?? null,
      apartment_number: (unitRow?.apartment_number as string | null) ?? null,
      buildings: { name: (buildings?.name as string) ?? 'Unknown' },
    }
    const daysOpen = computeDaysOpen(
      req.reported_at,
      req.status,
      req.resolved_at
    )

    return {
      id: req.id,
      description: req.description,
      status: req.status as MaintenanceStatus,
      reported_at: req.reported_at,
      daysOpen,
      isStale: isOverdueOpenRequest(req.status, daysOpen),
      unitLabel: formatUnitLabel({
        floor: unit.floor,
        apartment_number: unit.apartment_number,
        buildings: unit.buildings,
      }),
    }
  })

  return { data: rows, error: null }
}
