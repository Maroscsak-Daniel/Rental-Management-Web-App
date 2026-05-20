type UnitLocation = {
  floor?: string | null
  apartment_number?: string | null
  buildings?: { name: string } | null
}

export function formatUnitLocation(unit: UnitLocation): string {
  const parts: string[] = []
  if (unit.apartment_number) parts.push(`Apt ${unit.apartment_number}`)
  if (unit.floor) parts.push(unit.floor)
  return parts.length > 0 ? parts.join(', ') : 'N/A'
}

export function formatUnitLabel(unit: UnitLocation): string {
  const location = formatUnitLocation(unit)
  const buildingName = unit.buildings?.name
  return buildingName ? `${location} - ${buildingName}` : location
}
