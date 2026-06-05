import { Badge, StatusDot } from '../../components/Badge'
import { ChinaEChartsMap } from '../../components/ChinaEChartsMap'
import { Card, CardBody, CardHeader } from '../../components/Card'

export function OverviewPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row">
        <div className="w-full shrink-0 space-y-4 xl:w-[360px]">
          <Card>
            <CardHeader>
              <div className="text-sm font-semibold">系统数据</div>
              <Badge tone="brand">Live</Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="rounded-2xl border border-border bg-bg/20 px-4 py-3">
                <div className="text-xs text-muted">组织个数</div>
                <div className="mt-1 text-2xl font-semibold">18</div>
              </div>
              <div className="rounded-2xl border border-border bg-bg/20 px-4 py-3">
                <div className="text-xs text-muted">设备个数</div>
                <div className="mt-1 text-2xl font-semibold">248</div>
              </div>
              <div className="rounded-2xl border border-border bg-bg/20 px-4 py-3">
                <div className="text-xs text-muted">批次个数</div>
                <div className="mt-1 text-2xl font-semibold">36</div>
              </div>
              <div className="rounded-2xl border border-border bg-bg/20 px-4 py-3">
                <div className="text-xs text-muted">今日告警数</div>
                <div className="mt-1 text-2xl font-semibold text-status-danger">126</div>
              </div>
            </CardBody>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="text-sm font-semibold">在线概况</div>
              <Badge tone="success">
                <StatusDot tone="success" />
                Healthy
              </Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-bg/20 px-4 py-3">
                  <div className="text-xs text-muted">在线率</div>
                  <div className="mt-1 text-2xl font-semibold">96%</div>
                </div>
                <div className="rounded-2xl border border-border bg-bg/20 px-4 py-3">
                  <div className="text-xs text-muted">异常设备</div>
                  <div className="mt-1 text-2xl font-semibold text-status-danger">8</div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-bg/20 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>近 30 分钟新增告警</span>
                  <span className="font-semibold text-status-warning">+12</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-status-danger" />
                  <span className="text-xs text-muted">高风险</span>
                  <div className="ml-auto text-xs font-semibold">4</div>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-status-warning" />
                  <span className="text-xs text-muted">中风险</span>
                  <div className="ml-auto text-xs font-semibold">6</div>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-status-info" />
                  <span className="text-xs text-muted">低风险</span>
                  <div className="ml-auto text-xs font-semibold">2</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col">
          <CardHeader>
            <div className="space-y-0.5">
              <div className="text-sm font-semibold">全国地图</div>
              <div className="text-xs text-muted">合作组织 & 电子哨兵分布（示意）</div>
            </div>
            <Badge tone="info">Geo</Badge>
          </CardHeader>
          <CardBody className="min-h-0 flex-1">
            <ChinaEChartsMap />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
