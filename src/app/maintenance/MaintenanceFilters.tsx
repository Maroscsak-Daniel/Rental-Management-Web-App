'use client'

import { useRouter, usePathname } from 'next/navigation'
import { MaintenanceStatus } from '@/lib/definitions'
import { MAINTENANCE_STATUS_LABELS } from '@/lib/maintenance/state-machine'

type Building = { id: string; name: string }
type Unit = { id: string; floor: string | null; building_id: string }

const selectClass =
  'rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-gray-900 focus:border-[#25344F] focus:outline-none focus:ring-1 focus:ring-[#25344F] sm:text-sm'

export default function MaintenanceFilters({
  buildings,
  units,
  currentStatus,
  currentBuilding,
  currentUnit,
}: {
  buildings: Building[]
  units: Unit[]
  currentStatus: string
  currentBuilding: string
  currentUnit: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  function update(key: string, value: string) {
    const params = new URLSearchParams()
    const next = { status: currentStatus, building: currentBuilding, unit: currentUnit, [key]: value }
    if (key === 'building') next.unit = ''
    if (next.status) params.set('status', next.status)
    if (next.building) params.set('building', next.building)
    if (next.unit) params.set('unit', next.unit)
    router.push(`${pathname}?${params.toString()}`)
  }

  const visibleUnits = currentBuilding
    ? units.filter((u) => u.building_id === currentBuilding)
    : units

  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <select
        value={currentStatus}
        onChange={(e) => update('status', e.target.value)}
        className={selectClass}
      >
        <option value="">All statuses</option>
        {(['open', 'in_progress', 'resolved'] as MaintenanceStatus[]).map((s) => (
          <option key={s} value={s}>
            {MAINTENANCE_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        value={currentBuilding}
        onChange={(e) => update('building', e.target.value)}
        className={selectClass}
      >
        <option value="">All buildings</option>
        {buildings.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <select
        value={currentUnit}
        onChange={(e) => update('unit', e.target.value)}
        className={selectClass}
        disabled={visibleUnits.length === 0}
      >
        <option value="">All units</option>
        {visibleUnits.map((u) => (
          <option key={u.id} value={u.id}>
            Floor {u.floor || 'N/A'}
          </option>
        ))}
      </select>
    </div>
  )
}
