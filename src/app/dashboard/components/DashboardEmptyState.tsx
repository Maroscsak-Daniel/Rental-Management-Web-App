export default function DashboardEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="text-center py-8 px-4">
      <p className="text-sm font-medium text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {actionHref && actionLabel && (
        <a
          href={actionHref}
          className="mt-4 inline-flex text-sm font-medium text-[#781C21] hover:underline"
        >
          {actionLabel} →
        </a>
      )}
    </div>
  )
}
