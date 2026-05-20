'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NotificationBell from '@/components/NotificationBell'

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  },
  {
    name: 'Buildings',
    href: '/buildings',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
  },
  {
    name: 'Units',
    href: '/units',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    name: 'Tenants',
    href: '/tenants',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    name: 'Leases',
    href: '/leases',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>,
  },
  {
    name: 'Invoices',
    href: '/invoices',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  },
  {
    name: 'Maintenance',
    href: '/maintenance',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <ul className="-mx-2 space-y-2">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-x-3 rounded-md p-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#617891] text-white'
                  : 'text-zinc-300 hover:bg-[#617891]/50 hover:text-white'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

const signOutButton = (
  <form action="/api/auth/logout" method="post">
    <button
      type="submit"
      className="flex w-full items-center gap-x-3 rounded-md bg-[#781C21] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#61161a] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#25344F]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
      Sign out
    </button>
  </form>
)

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <nav className="fixed inset-y-0 left-0 z-50 hidden md:flex w-64 flex-col bg-[#25344F] border-r border-[#25344F]">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-[#617891]/30">
          <span className="text-xl font-bold tracking-tight text-white">Rental Manager</span>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto px-0 py-6">
          <NotificationBell />
          <ul className="flex flex-1 flex-col gap-y-4 px-4">
            <li><NavLinks /></li>
            <li className="mt-auto">{signOutButton}</li>
          </ul>
        </div>
      </nav>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <div className="fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between bg-[#25344F] px-4 md:hidden">
        <span className="text-lg font-bold tracking-tight text-white">Rental Manager</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-zinc-300 hover:text-white focus:outline-none"
          aria-label="Open navigation menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      {/* ── Mobile slide-out drawer ─────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <nav className="fixed inset-y-0 left-0 w-64 flex flex-col bg-[#25344F]">
            <div className="flex h-14 shrink-0 items-center justify-between px-6 border-b border-[#617891]/30">
              <span className="text-lg font-bold tracking-tight text-white">Rental Manager</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-zinc-300 hover:text-white focus:outline-none"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto py-6">
              <ul className="flex flex-1 flex-col gap-y-4 px-4">
                <li><NavLinks onNavigate={() => setOpen(false)} /></li>
                <li className="mt-auto">{signOutButton}</li>
              </ul>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
