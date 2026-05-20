import { MaintenanceStatus } from '@/lib/definitions'

const ALLOWED_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  open: ['in_progress', 'resolved'],
  in_progress: ['resolved'],
  resolved: [],
}

export function isValidMaintenanceTransition(
  from: MaintenanceStatus,
  to: MaintenanceStatus
): boolean {
  if (from === to) return true
  return ALLOWED_TRANSITIONS[from].includes(to)
}

export function getAllowedNextStatuses(
  current: MaintenanceStatus
): MaintenanceStatus[] {
  return ALLOWED_TRANSITIONS[current]
}

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}
