import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { cn } from '../../lib/cn'
import { useAuth } from '../auth/useAuth'
import { useTheme } from '../theme/useTheme'

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
  const { user, logout, hasPermission } = useAuth()
  const { toggle, mode } = useTheme()

  const showUsers = user?.role === 'SystemAdmin' && hasPermission('user:read')
  const showBatches = user?.role === 'SystemAdmin' && hasPermission('batch:read')

  return (
    <div className="flex h-full min-h-screen bg-bg text-fg">
      <aside className="w-[260px] border-r border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <div className="text-sm font-semibold">电子哨兵 Admin</div>
            <div className="text-xs text-muted">{user?.role}</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          <SideNavItem to="/admin/overview" label="概览" />
          <SideNavItem to="/admin/orgs" label="组织管理" />
          {showUsers && <SideNavItem to="/admin/users" label="用户管理" />}
          <SideNavItem to="/admin/devices" label="设备管理" />
          {showBatches && <SideNavItem to="/admin/batches" label="批次管理" />}
          <SideNavItem to="/admin/alarms" label="告警列表" />
        </nav>
        <div className="mt-auto border-t border-border p-3">
          <div className="rounded-xl border border-border bg-bg/20 p-3">
            <div className="text-xs text-muted">当前用户</div>
            <div className="mt-1 text-sm font-semibold">{user?.name}</div>
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={toggle} className="flex-1">
                主题：{mode === 'system' ? '系统' : mode === 'dark' ? '暗色' : '亮色'}
              </Button>
              <Button size="sm" variant="danger" onClick={logout} className="flex-1">
                退出
              </Button>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
          <div className="text-sm text-muted">原型演示 · 卡片式布局 · Light/Dark</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => navigate('/wallboard')}>
              Web 大屏
            </Button>
          </div>
        </header>
        <div className="min-w-0 flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
