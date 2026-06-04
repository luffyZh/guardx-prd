import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card, CardBody } from '../components/Card'

export function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-[720px] p-6">
      <Card>
        <CardBody className="space-y-3">
          <div className="text-lg font-semibold text-fg">403 · 无权限访问该页面</div>
          <div className="text-sm text-muted">你的账号权限不足，已为你准备返回入口。</div>
          <div className="flex gap-2">
            <Link to="/wallboard">
              <Button variant="primary">返回 Web 大屏</Button>
            </Link>
            <Link to="/admin/overview">
              <Button>返回 Admin 概览</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

