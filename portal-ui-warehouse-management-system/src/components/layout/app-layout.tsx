import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { getSimulateError, setSimulateError } from '@/api/client'
import { navIcons } from '@/components/layout/icons'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useRole } from '@/providers/role-provider'
import type { UserRole } from '@/types'

const navItems = [
  { to: '/', label: 'Dashboard', key: 'dashboard', exact: true },
  { to: '/purchase-requests', label: 'Purchase Requests', key: 'requests' },
  { to: '/purchase-orders', label: 'Purchase Orders', key: 'orders' },
  { to: '/inventory', label: 'Inventory', key: 'inventory' },
]

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/purchase-requests': 'Purchase Requests',
  '/purchase-orders': 'Purchase Orders',
  '/inventory': 'Inventory',
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav aria-label="Main navigation">
      <div className="px-2 text-[10px] font-medium uppercase tracking-[0.06em] text-dark-light-active">
        Procurement
      </div>
      <ul className="mt-1.5 space-y-0.5">
        {navItems.map((item) => {
          const Icon = navIcons[item.key]
          const active =
            item.exact ? pathname === item.to : pathname.startsWith(item.to)

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  'flex h-[38px] items-center gap-2 rounded-lg px-2.5 text-[13px] text-dark-normal-active transition-colors',
                  active
                    ? 'bg-[#E9ECEF] font-medium text-dark-active'
                    : 'hover:bg-[#E9ECEF]/70',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { role, userName, setRole } = useRole()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [errorMode, setErrorMode] = useState(getSimulateError())

  const pageTitle =
    Object.entries(pageTitles).find(([path]) =>
      path === '/' ? pathname === '/' : pathname.startsWith(path),
    )?.[1] ?? 'ProcureFlow'

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-1 bg-white md:my-6 md:min-h-[calc(100vh-48px)] md:w-[calc(100vw-48px)] md:grid-cols-[240px_minmax(0,1fr)] md:overflow-hidden md:rounded-app md:border md:border-border md:shadow-app">
      <aside className="hidden border-r border-border bg-surface-sidebar p-4 md:sticky md:top-0 md:block md:h-[calc(100vh-48px)] md:overflow-auto">
        <div className="mb-4 flex items-center gap-2.5 font-semibold">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-blue-normal text-[10px] text-white">
            PF
          </div>
          ProcureFlow
        </div>
        <SidebarNav />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 h-full w-[260px] border-r border-border bg-surface-sidebar p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 font-semibold">
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-blue-normal text-[10px] text-white">
                  PF
                </div>
                ProcureFlow
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur md:px-5">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-[15px] font-medium">{pageTitle}</h1>
              <span className="text-[11px] text-dark-light-active">
                Inventory Procurement · v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="role-switcher" className="sr-only">
              Switch role
            </label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
            >
              <SelectTrigger id="role-switcher" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">USER</SelectItem>
                <SelectItem value="APPROVER">APPROVER</SelectItem>
              </SelectContent>
            </Select>
            <span className="hidden text-[11px] text-dark-normal sm:inline">{userName}</span>
            <Button
              variant={errorMode ? 'destructive' : 'default'}
              onClick={() => {
                const next = !errorMode
                setErrorMode(next)
                setSimulateError(next)
              }}
              title="Toggle mock API error simulation"
            >
              {errorMode ? 'Error Mode ON' : 'Mock Error'}
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
