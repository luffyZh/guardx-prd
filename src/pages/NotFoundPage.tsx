import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card, CardBody } from '../components/Card'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-[720px] p-6">
      <Card>
        <CardBody className="space-y-3">
          <div className="text-lg font-semibold text-fg">404 · 页面不存在</div>
          <div className="text-sm text-muted">你访问的地址不存在或已被移动。</div>
          <div className="flex gap-2">
            <Link to="/wallboard">
              <Button variant="primary">前往 Web 大屏</Button>
            </Link>
            <Link to="/login">
              <Button>前往登录</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

