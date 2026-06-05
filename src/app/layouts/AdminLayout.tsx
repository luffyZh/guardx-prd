import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { cn } from '../../lib/cn'
import { useAuth } from '../auth/useAuth'
import { useTheme } from '../theme/useTheme'

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 17.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.55 1.55M18.25 18.25l1.55 1.55M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.55-1.55M18.25 5.75l1.55-1.55"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M21 15.2a7.7 7.7 0 0 1-10.25-10.2 1 1 0 0 0-1.2-1.25A9 9 0 1 0 22.2 16.4a1 1 0 0 0-1.2-1.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6.7 9.4 12 14.7l5.3-5.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4.8 5.5h14.4A2.3 2.3 0 0 1 21.5 7.8v7.4a2.3 2.3 0 0 1-2.3 2.3H4.8a2.3 2.3 0 0 1-2.3-2.3V7.8a2.3 2.3 0 0 1 2.3-2.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.2 20h5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M10 7.5V6.3A1.8 1.8 0 0 1 11.8 4.5h6A1.8 1.8 0 0 1 19.5 6.3v11.4a1.8 1.8 0 0 1-1.7 1.8h-6A1.8 1.8 0 0 1 10 17.7v-1.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4.5 12h9M8.2 8.8 4.5 12l3.7 3.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function initials(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/)
  const first = parts[0]?.[0] ?? '?'
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : trimmed[1] ?? ''
  return `${first}${second}`.toUpperCase()
}

function SideNavItem({
  to,
  label,
}: {
  to: string
  label: string
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center rounded-xl px-3 text-sm font-medium transition',
          isActive ? 'bg-brand-700 text-white' : 'text-fg hover:bg-bg/30',
        )
      }
    >
      {label}
    </NavLink>
  )
}

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isAuthenticated } = useAuth()
  const { toggle, isDark } = useTheme()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!userMenuOpen) return
    const onDown = (e: MouseEvent) => {
      const el = userMenuWrapRef.current
      if (!el) return
      if (e.target instanceof Node && el.contains(e.target)) return
      setUserMenuOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [userMenuOpen])

  const headerMeta = useMemo(() => {
    const p = location.pathname
    if (p.startsWith('/admin/devices/new')) return { title: '新增设备', roles: ['超级管理员', '组织管理员'] }
    if (p.startsWith('/admin/devices/')) return { title: '设备详情', roles: ['超级管理员', '组织管理员', '组织用户'] }
    if (p.startsWith('/admin/devices')) return { title: '设备管理', roles: ['超级管理员', '组织管理员', '组织用户'] }

    if (p.startsWith('/admin/orgs/')) return { title: '组织详情', roles: ['超级管理员', '组织管理员'] }
    if (p.startsWith('/admin/orgs')) return { title: '组织管理', roles: ['超级管理员', '组织管理员'] }

    if (p.startsWith('/admin/users')) return { title: '用户管理', roles: ['超级管理员'] }

    if (p.startsWith('/admin/batches/new')) return { title: '新增批次', roles: ['超级管理员'] }
    if (p.startsWith('/admin/batches/')) return { title: '批次详情', roles: ['超级管理员'] }
    if (p.startsWith('/admin/batches')) return { title: '批次管理', roles: ['超级管理员'] }

    if (p.startsWith('/admin/alarms')) return { title: '告警列表', roles: ['超级管理员', '组织管理员', '组织用户'] }

    return { title: '概览', roles: ['超级管理员', '组织管理员'] }
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-fg">
      <aside className="flex w-[260px] flex-col border-r border-border bg-surface">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="favicon" className="h-8 w-8 rounded-full" />
            <div className="text-base font-semibold">电子哨兵管理系统</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          <SideNavItem to="/admin/overview" label="概览" />
          <SideNavItem to="/admin/orgs" label="组织管理" />
          <SideNavItem to="/admin/users" label="用户管理" />
          <SideNavItem to="/admin/devices" label="设备管理" />
          <SideNavItem to="/admin/batches" label="批次管理" />
          <SideNavItem to="/admin/alarms" label="告警列表" />
        </nav>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface/90 px-6 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <div className="truncate text-base font-semibold">{headerMeta.title}</div>
            <div className="flex flex-wrap items-center gap-2">
              {headerMeta.roles.map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-border bg-bg/20 px-2.5 py-1 text-xs font-medium text-muted"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggle}
              className="h-9 w-9 rounded-xl p-0"
              aria-label="切换主题"
            >
              {isDark ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </Button>

            <div className="relative" ref={userMenuWrapRef}>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="h-9 rounded-xl px-2.5"
              >
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand-600/80 to-brand-800 text-[11px] font-semibold text-white">
                    {initials(user?.name ?? '访客')}
                  </div>
                  <div className="max-w-[140px] truncate text-xs font-semibold">{user?.name ?? '访客'}</div>
                  <ChevronDownIcon className={cn('h-4 w-4 text-muted transition', userMenuOpen && 'rotate-180')} />
                </div>
              </Button>

              {userMenuOpen && (
                <div className="absolute right-0 top-[44px] z-30 w-[210px] overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-bg/40"
                    onClick={() => {
                      setUserMenuOpen(false)
                      navigate('/wallboard')
                    }}
                  >
                    <MonitorIcon className="h-5 w-5 text-muted" />
                    <span className="font-medium">前往 Web 大屏</span>
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-bg/40"
                    onClick={() => {
                      setUserMenuOpen(false)
                      logout()
                      navigate(isAuthenticated ? '/login' : '/login')
                    }}
                  >
                    <LogoutIcon className="h-5 w-5 text-status-danger" />
                    <span className="font-medium text-status-danger">退出登录</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="min-w-0 flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
