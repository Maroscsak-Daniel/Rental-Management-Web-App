export function computeDaysOpen(
  reportedAt: string,
  status: string,
  resolvedAt: string | null
): number {
  const start = new Date(reportedAt)
  const end =
    status === 'resolved' && resolvedAt
      ? new Date(resolvedAt)
      : new Date()

  const diffMs = end.getTime() - start.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

export function isOverdueOpenRequest(
  status: string,
  daysOpen: number
): boolean {
  return status === 'open' && daysOpen > 7
}
