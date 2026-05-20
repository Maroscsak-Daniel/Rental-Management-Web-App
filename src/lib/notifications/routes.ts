import { NotificationType } from '@/lib/definitions'

export function getNotificationHref(
  type: NotificationType,
  referenceId: string
): string {
  switch (type) {
    case 'lease_expiry':
      return `/leases/${referenceId}`
    case 'payment_overdue':
      return `/invoices/${referenceId}`
    case 'maintenance_stale':
      return `/maintenance/${referenceId}`
    default:
      return '/dashboard'
  }
}
