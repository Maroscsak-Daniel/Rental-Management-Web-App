import { MaintenanceStatus } from '@/lib/definitions'
import { MAINTENANCE_STATUS_LABELS } from '@/lib/maintenance/state-machine'

const STATUS_STYLES: Record<MaintenanceStatus, string> = {
  open: 'bg-amber-400/10 text-amber-400 ring-amber-400/20',
  in_progress: 'bg-blue-400/10 text-blue-400 ring-blue-400/20',
  resolved: 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20',
}

export default function MaintenanceStatusBadge({
  status,
}: {
  status: MaintenanceStatus
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {MAINTENANCE_STATUS_LABELS[status]}
    </span>
  )
}
