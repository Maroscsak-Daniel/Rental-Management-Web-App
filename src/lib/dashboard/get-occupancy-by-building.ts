import { createClient } from '@/lib/supabase/server'

export type BuildingOccupancy = {
  id: string
  name: string
  address: string
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
}

export async function getOccupancyByBuilding(): Promise<{
  data: BuildingOccupancy[]
  error: string | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: 'Not authenticated' }
  }

  const { data: buildings, error: buildingsError } = await supabase
    .from('buildings')
    .select('id, name, address')
    .eq('landlord_id', user.id)
    .order('name')

  if (buildingsError) {
    return { data: [], error: buildingsError.message }
  }

  if (!buildings?.length) {
    return { data: [], error: null }
  }

  const buildingIds = buildings.map((b) => b.id)

  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select('id, building_id')
    .in('building_id', buildingIds)

  if (unitsError) {
    return { data: [], error: unitsError.message }
  }

  const { data: activeLeases, error: leasesError } = await supabase
    .from('leases')
    .select('unit_id')
    .eq('landlord_id', user.id)
    .eq('status', 'active')

  if (leasesError) {
    return { data: [], error: leasesError.message }
  }

  const occupiedUnitIds = new Set((activeLeases ?? []).map((l) => l.unit_id))

  const unitsByBuilding = new Map<string, string[]>()
  for (const unit of units ?? []) {
    const list = unitsByBuilding.get(unit.building_id) ?? []
    list.push(unit.id)
    unitsByBuilding.set(unit.building_id, list)
  }

  const data: BuildingOccupancy[] = buildings.map((building) => {
    const buildingUnits = unitsByBuilding.get(building.id) ?? []
    const occupiedUnits = buildingUnits.filter((id) => occupiedUnitIds.has(id)).length
    const totalUnits = buildingUnits.length
    return {
      id: building.id,
      name: building.name,
      address: building.address,
      totalUnits,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
    }
  })

  return { data, error: null }
}
