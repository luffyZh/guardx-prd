import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { useAuth } from '../../app/auth/useAuth'

export function OverviewPage() {
  const { user, hasPermission } = useAuth()

  const tiles = [
    { title: '组织管理', desc: '多组织入驻与启停控制', to: '/admin/orgs', perm: 'org:read' as const },
    { title: '用户管理', desc: '账号分配、角色与重置密码', to: '/admin/users', perm: 'user:read' as const },
    { title: '设备管理', desc: '绑定、状态、详情与日志', to: '/admin/devices', perm: 'device:read' as const },
    { title: '批次管理', desc: '批次生成与设备 ID 池', to: '/admin/batches', perm: 'batch:read' as const },
    { title: '告警列表', desc: '筛选、查看、处置闭环', to: '/admin/alarms', perm: 'alarm:read' as const },
  ].filter((t) => hasPermission(t.perm))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <div className="text-base font-semibold">概览</div>
            <div className="text-xs text-muted">欢迎，{user?.name}</div>
          </div>
          <Badge tone="brand">Prototype</Badge>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t) => (
            <Link key={t.to} to={t.to} className="group">
              <div className="rounded-2xl border border-border bg-bg/20 p-4 transition group-hover:shadow-cardHover">
                <div className="text-sm font-semibold">{t.title}</div>
                <div className="mt-1 text-xs text-muted">{t.desc}</div>
                <div className="mt-3">
                  <Button size="sm">进入</Button>
                </div>
              </div>
            </Link>
          ))}
        </CardBody>
      </Card>
    </div>
  )
}
