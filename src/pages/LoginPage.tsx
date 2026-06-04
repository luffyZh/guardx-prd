import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card, CardBody, CardHeader } from '../components/Card'
import { ErrorText, Hint, Input, Label } from '../components/Field'
import { useAuth } from '../app/auth/useAuth'
import { useToast } from '../app/toast/useToast'
import type { Role } from '../types/auth'

export function LoginPage() {
  const { login, quickLogin, isAuthenticated } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from ?? '/admin/overview'
  }, [location.state])

  const [account, setAccount] = useState('nh-admin')
  const [password, setPassword] = useState('hfklhjs_f233jjks@!')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return
    navigate('/admin/overview', { replace: true })
  }, [isAuthenticated, navigate])

  const doLogin = async () => {
    setError(null)
    if (!account.trim() || !password.trim()) {
      setError('请输入账号与密码')
      return
    }
    try {
      setLoading(true)
      await login(account, password)
      toast.push('success', '登录成功')
      navigate(from, { replace: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '登录失败'
      setError(msg)
      toast.push('error', msg)
    } finally {
      setLoading(false)
    }
  }

  const doQuick = async (role: Role) => {
    setError(null)
    try {
      setLoading(true)
      await quickLogin(role)
      toast.push('success', `已登录为 ${role}`)
      navigate('/admin/overview', { replace: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '登录失败'
      setError(msg)
      toast.push('error', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10 text-fg">
      <div className="mx-auto flex max-w-[980px] items-stretch gap-6">
        <div className="hidden flex-1 flex-col justify-between rounded-2xl border border-border bg-surface p-8 shadow-card md:flex">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-muted">GuardX</div>
            <div className="text-3xl font-semibold tracking-tight text-fg">电子哨兵管理原型</div>
            <div className="text-sm leading-6 text-muted">
              卡片式布局 · 军绿色主题 · Light/Dark · 全模块可点通
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-muted">PRD 重点演示</div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">组织管理</span>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">设备管理</span>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">批次管理</span>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">告警闭环</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[440px]">
          <Card>
            <CardHeader>
              <div>
                <div className="text-base font-semibold text-fg">登录</div>
                <div className="text-xs text-muted">账号支持账号名/手机号</div>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <Label>账号</Label>
                <Input
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="nh-admin / 13011112222"
                  autoComplete="username"
                />
                <Hint>示例：nh-admin / 13011112222</Hint>
              </div>
              <div className="space-y-2">
                <Label>密码</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <Hint>示例：hfklhjs_f233jjks@!</Hint>
              </div>
              {error && <ErrorText>{error}</ErrorText>}
              <Button variant="primary" className="w-full" disabled={loading} onClick={doLogin}>
                {loading ? '登录中...' : '登录'}
              </Button>

              <div className="pt-2">
                <div className="text-xs font-semibold text-muted">快速登录（演示）</div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <Button size="sm" disabled={loading} onClick={() => doQuick('SystemAdmin')}>
                    系统管理员
                  </Button>
                  <Button size="sm" disabled={loading} onClick={() => doQuick('OrgAdmin')}>
                    组织管理员
                  </Button>
                  <Button size="sm" disabled={loading} onClick={() => doQuick('OrgUser')}>
                    组织用户
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="mt-4 text-center text-xs text-muted">
            无权限页面将重定向到 403，并提供返回 Web 大屏入口
          </div>
        </div>
      </div>
    </div>
  )
}
