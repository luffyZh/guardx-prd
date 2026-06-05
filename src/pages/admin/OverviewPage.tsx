import { ChinaMap } from '../../components/ChinaMap'
import { Card, CardBody, CardHeader } from '../../components/Card'

export function OverviewPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 横着五个均分，现在是每个占据一行 */}
      <div className="grid gap-5 grid-cols-5 min-h-0">
        <Card>
          <CardBody>
            <div className="text-xs text-muted">组织个数</div>
            <div className="mt-1 text-3xl font-semibold">18</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-muted">批次个数</div>
            <div className="mt-1 text-3xl font-semibold">36</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-muted">用户个数</div>
            <div className="mt-1 text-3xl font-semibold">128</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-muted">设备个数</div>
            <div className="mt-1 text-3xl font-semibold">248</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-muted">进入告警数</div>
            <div className="mt-1 text-3xl font-semibold text-status-danger">126</div>
          </CardBody>
        </Card>
      </div>

      <div className="min-h-0 flex-1 pt-4">
        <Card className="flex h-full min-h-0 flex-col">
          <CardHeader>
            <div className="space-y-0.5">
              <div className="text-sm font-semibold">全国地图</div>
              <div className="text-xs text-muted">合作组织 & 电子哨兵分布（示意）</div>
            </div>
            <div className="text-xs text-muted">Geo</div>
          </CardHeader>
          <CardBody className="min-h-0 flex-1">
            <ChinaMap />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
