'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TenantNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Home',
      href: '/tenant/portal',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      ),
    },
    {
      name: 'Invoices',
      href: '/tenant/invoices',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
      ),
    },
    {
      name: 'Maintenance',
      href: '/tenant/maintenance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      ),
    },
  ]

  return (
    <nav className="fixed inset-y-0 left-0 z-50 hidden md:flex w-64 flex-col bg-[#25344F] border-r border-[#25344F] sidebar">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-[#617891]/30">
        <span className="text-xl font-bold tracking-tight text-white">Tenant Portal</span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-0 py-6">
        <ul className="flex flex-1 flex-col gap-y-4 px-4">
          <li>
            <ul className="-mx-2 space-y-2">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/tenant/portal'
                    ? pathname === '/tenant/portal'
                    : pathname.startsWith(item.href)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
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
          </li>
          <li className="mt-auto">
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="flex w-full items-center gap-x-3 rounded-md bg-[#781C21] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#61161a] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#25344F]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                Sign out
              </button>
            </form>
          </li>
        </ul>
      </div>
    </nav>
  )
}
