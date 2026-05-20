'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Notification } from '@/lib/definitions'
import { getNotificationHref } from '@/lib/notifications/routes'
import {
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
} from '@/app/notifications/actions'

const TYPE_LABELS: Record<Notification['type'], string> = {
  lease_expiry: 'Lease expiring',
  payment_overdue: 'Payment overdue',
  maintenance_stale: 'Stale maintenance',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await getUnreadNotifications()
    setNotifications(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id)
    setOpen(false)
    router.push(getNotificationHref(notification.type, notification.reference_id))
  }

  const handleMarkAll = async () => {
    await markAllAsRead()
    setNotifications([])
    setOpen(false)
  }

  const count = notifications.length

  return (
    <div className="relative px-4 mb-4" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          if (!open) load()
        }}
        className="relative flex w-full items-center gap-x-3 rounded-md p-2.5 text-sm font-medium text-zinc-300 hover:bg-[#617891]/50 hover:text-white transition-colors"
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
        aria-expanded={open}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        <span>Notifications</span>
        {count > 0 && (
          <span className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[#781C21] px-1.5 py-0.5 text-xs font-semibold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-4 right-4 top-full z-50 mt-1 max-h-80 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unread
            </span>
            {count > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs font-medium text-[#781C21] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                No unread notifications.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className="w-full px-3 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-xs font-medium text-[#781C21]">
                        {TYPE_LABELS[n.type]}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-700 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
