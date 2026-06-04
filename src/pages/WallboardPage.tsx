import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card, CardBody, CardHeader } from '../components/Card'
import { Badge, StatusDot } from '../components/Badge'
import { useTheme } from '../app/theme/useTheme'

export function WallboardPage() {
  const { toggle, mode } = useTheme()

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-muted">电子哨兵 Web 大屏</div>
            <div className="text-lg font-semibold">全局态势 · 告警闭环</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={toggle}>
              主题：{mode === 'system' ? '系统' : mode === 'dark' ? '暗色' : '亮色'}
            </Button>
            <Link to="/login">
              <Button size="sm" variant="primary">
                前往 Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-4 p-6">
        <Card className="col-span-12 md:col-span-4">
          <CardHeader>
            <div className="text-sm font-semibold">在线设备</div>
            <Badge tone="success">
              <StatusDot tone="success" />
              Online
            </Badge>
          </CardHeader>
          <CardBody>
            <div className="text-4xl font-semibold">18</div>
            <div className="mt-1 text-sm text-muted">今日平均在线率 96%</div>
          </CardBody>
        </Card>
        <Card className="col-span-12 md:col-span-4">
          <CardHeader>
            <div className="text-sm font-semibold">告警待处理</div>
            <Badge tone="danger">
              <StatusDot tone="danger" />
              Pending
            </Badge>
          </CardHeader>
          <CardBody>
            <div className="text-4xl font-semibold">6</div>
            <div className="mt-1 text-sm text-muted">近 30 分钟新增 2 条</div>
          </CardBody>
        </Card>
        <Card className="col-span-12 md:col-span-4">
          <CardHeader>
            <div className="text-sm font-semibold">今日处理闭环</div>
            <Badge tone="brand">闭环率</Badge>
          </CardHeader>
          <CardBody>
            <div className="text-4xl font-semibold">82%</div>
            <div className="mt-1 text-sm text-muted">平均处置时长 3m 12s</div>
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-8">
          <CardHeader>
            <div className="text-sm font-semibold">区域态势（占位）</div>
            <Badge tone="info">地图 / 热力图</Badge>
          </CardHeader>
          <CardBody>
            <div className="flex h-[360px] items-center justify-center rounded-xl border border-border bg-bg/20 text-sm text-muted">
              Map Placeholder
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <div className="text-sm font-semibold">最新告警（占位）</div>
            <Link to="/admin/alarms">
              <Button size="sm">进入告警列表</Button>
            </Link>
          </CardHeader>
          <CardBody className="space-y-3">
            {['人员闯入', '异常徘徊', '未戴安全帽', '设备破坏'].map((t) => (
              <div key={t} className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2">
                <div className="text-sm font-medium">{t}</div>
                <Badge tone="warning">处理中</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
