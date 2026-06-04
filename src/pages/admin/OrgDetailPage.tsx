import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../app/auth/useAuth'
import { useToast } from '../../app/toast/useToast'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { ErrorText, Hint, Input, Label, Select } from '../../components/Field'
import { Confirm, Modal } from '../../components/Modal'
import { Table, Td, Th, Tr } from '../../components/Table'
import { Tabs } from '../../components/Tabs'
import { createId } from '../../lib/id'
import type { AppUser, Role } from '../../types/auth'
import type { Device, Org } from '../../types/models'
import {
  alarmStatsByOrg,
  getOrg,
  listAllDevicesByOrg,
  listAllUsersByOrg,
  resetUserPassword,
  toggleUserStatus,
  upsertUser,
} from '../../mocks/api'

function roleLabel(role: Role) {
  if (role === 'SystemAdmin') return '系统管理员'
  if (role === 'OrgAdmin') return '组织管理员'
  return '组织用户'
}

export function OrgDetailPage() {
  const { orgId: routeOrgId } = useParams()
  const orgId = routeOrgId ?? ''
  const toast = useToast()
  const { user } = useAuth()

  const [sp] = useSearchParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = sp.get('tab') ?? 'users'

  const canSee = user?.role === 'SystemAdmin' || user?.orgId === orgId
  const canManageUsers = user?.role === 'SystemAdmin' || user?.role === 'OrgAdmin'

  const [org, setOrg] = useState<Org | null>(null)
  const [orgError, setOrgError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [users, setUsers] = useState<AppUser[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [stats, setStats] = useState<{ total: number; pending: number; processing: number; resolved: number } | null>(null)

  const [qUser, setQUser] = useState('')
  const filteredUsers = useMemo(() => {
    const q = qUser.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => u.name.toLowerCase().includes(q) || (u.phone ?? '').includes(q))
  }, [users, qUser])

  const [editOpen, setEditOpen] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [form, setForm] = useState<AppUser | null>(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<AppUser | null>(null)

  const [resetOpen, setResetOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<AppUser | null>(null)
  const [resetResult, setResetResult] = useState<string | null>(null)

  useEffect(() => {
    if (!canSee) return
    let alive = true
    const run = async () => {
      setLoading(true)
      setOrgError(null)
      try {
        const o = await getOrg(orgId)
        if (!alive) return
        setOrg(o)
      } catch (e) {
        const msg = e instanceof Error ? e.message : '加载失败'
        if (!alive) return
        setOrgError(msg)
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [orgId, canSee])

  useEffect(() => {
    if (!canSee) return
    let alive = true
    const run = async () => {
      try {
        const [u, d, s] = await Promise.all([
          listAllUsersByOrg(orgId),
          listAllDevicesByOrg(orgId),
          alarmStatsByOrg(orgId),
        ])
        if (!alive) return
        setUsers(u)
        setDevices(d)
        setStats(s)
      } catch (e) {
        const msg = e instanceof Error ? e.message : '加载失败'
        toast.push('error', msg)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [orgId, canSee, toast])

  const openCreateUser = () => {
    setForm({
      id: createId('user'),
      name: '',
      phone: '',
      orgId,
      role: 'OrgUser',
      permissions: [],
      status: 'Enabled',
    })
    setEditError(null)
    setEditOpen(true)
  }

  const openEditUser = (u: AppUser) => {
    setForm({ ...u })
    setEditError(null)
    setEditOpen(true)
  }

  const submitUser = async () => {
    if (!form) return
    setEditError(null)
    if (!form.name.trim()) return setEditError('请填写用户名')
    if (!form.phone?.trim()) return setEditError('请填写手机号')
    if (form.role === 'SystemAdmin') return setEditError('组织内用户不可设置为系统管理员')
    try {
      setLoading(true)
      await upsertUser(form)
      toast.push('success', '保存成功（默认密码已生成）')
      setEditOpen(false)
      const next = await listAllUsersByOrg(orgId)
      setUsers(next)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '保存失败'
      setEditError(msg)
      toast.push('error', msg)
    } finally {
      setLoading(false)
    }
  }

  const askToggle = (u: AppUser) => {
    setConfirmTarget(u)
    setConfirmOpen(true)
  }

  const doToggle = async () => {
    if (!confirmTarget) return
    try {
      setLoading(true)
      await toggleUserStatus(confirmTarget.id)
      toast.push('success', '已更新用户状态')
      setConfirmOpen(false)
      const next = await listAllUsersByOrg(orgId)
      setUsers(next)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '操作失败'
      toast.push('error', msg)
    } finally {
      setLoading(false)
    }
  }

  const openReset = (u: AppUser) => {
    setResetTarget(u)
    setResetResult(null)
    setResetOpen(true)
  }

  const doReset = async () => {
    if (!resetTarget) return
    try {
      setLoading(true)
      const res = await resetUserPassword(resetTarget.id)
      setResetResult(res.password)
      toast.push('success', '已重置密码')
    } catch (e) {
      const msg = e instanceof Error ? e.message : '操作失败'
      toast.push('error', msg)
    } finally {
      setLoading(false)
    }
  }

  const setTab = (t: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', t)
    setSearchParams(next, { replace: true })
  }

  if (!canSee) {
    return (
      <Card>
        <CardBody>
          <ErrorText>无权限查看该组织</ErrorText>
        </CardBody>
      </Card>
    )
  }

  if (orgError) {
    return (
      <Card>
        <CardBody>
          <ErrorText>{orgError}</ErrorText>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <div className="text-base font-semibold">组织详情</div>
            <div className="text-xs text-muted">{org?.name ?? orgId}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/orgs">
              <Button size="sm">返回列表</Button>
            </Link>
          </div>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-bg/20 p-4">
            <div className="text-xs text-muted">组织 ID</div>
            <div className="mt-1 text-sm font-semibold">{org?.id ?? '-'}</div>
          </div>
          <div className="rounded-2xl border border-border bg-bg/20 p-4">
            <div className="text-xs text-muted">联系人</div>
            <div className="mt-1 text-sm font-semibold">{org?.contactName ?? '-'}</div>
          </div>
          <div className="rounded-2xl border border-border bg-bg/20 p-4">
            <div className="text-xs text-muted">联系电话</div>
            <div className="mt-1 text-sm font-semibold">{org?.contactPhone ?? '-'}</div>
          </div>
          <div className="rounded-2xl border border-border bg-bg/20 p-4">
            <div className="text-xs text-muted">状态</div>
            <div className="mt-1">{org?.status === 'Enabled' ? <Badge tone="success">启用</Badge> : <Badge tone="danger">停用</Badge>}</div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Tabs
            value={tab}
            options={[
              { value: 'users', label: '用户列表' },
              { value: 'devices', label: '设备列表' },
              { value: 'stats', label: '告警统计' },
            ]}
            onChange={setTab}
          />
          {tab === 'users' && canManageUsers && (
            <Button variant="primary" onClick={openCreateUser}>
              新增用户
            </Button>
          )}
        </CardHeader>
        <CardBody>
          {tab === 'users' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>搜索</Label>
                  <Input value={qUser} onChange={(e) => setQUser(e.target.value)} placeholder="用户名 / 手机号" />
                  <Hint>组织管理员在此管理组织内用户</Hint>
                </div>
              </div>
              <div className="rounded-2xl border border-border">
                <Table>
                  <thead>
                    <tr>
                      <Th>用户名</Th>
                      <Th>手机号</Th>
                      <Th>角色</Th>
                      <Th>状态</Th>
                      <Th className="text-right">操作</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <Td colSpan={5} className="py-10 text-center text-muted">
                          暂无数据
                        </Td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <Tr key={u.id}>
                          <Td className="font-medium">{u.name}</Td>
                          <Td>{u.phone}</Td>
                          <Td>{roleLabel(u.role)}</Td>
                          <Td>{u.status === 'Enabled' ? <Badge tone="success">启用</Badge> : <Badge tone="danger">停用</Badge>}</Td>
                          <Td className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => openEditUser(u)} disabled={!canManageUsers}>
                                编辑
                              </Button>
                              <Button size="sm" onClick={() => openReset(u)} disabled={!canManageUsers}>
                                重置密码
                              </Button>
                              <Button
                                size="sm"
                                variant={u.status === 'Enabled' ? 'danger' : 'primary'}
                                onClick={() => askToggle(u)}
                                disabled={!canManageUsers}
                              >
                                {u.status === 'Enabled' ? '停用' : '启用'}
                              </Button>
                            </div>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          )}

          {tab === 'devices' && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-border">
                <Table>
                  <thead>
                    <tr>
                      <Th>设备 ID</Th>
                      <Th>设备名称</Th>
                      <Th>在线状态</Th>
                      <Th>最后心跳</Th>
                      <Th className="text-right">操作</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.length === 0 ? (
                      <tr>
                        <Td colSpan={5} className="py-10 text-center text-muted">
                          暂无数据
                        </Td>
                      </tr>
                    ) : (
                      devices.map((d) => (
                        <Tr key={d.id}>
                          <Td className="font-medium">{d.id}</Td>
                          <Td>{d.name}</Td>
                          <Td>
                            {d.onlineStatus === 'Online' ? (
                              <Badge tone="success">在线</Badge>
                            ) : d.onlineStatus === 'Offline' ? (
                              <Badge tone="muted">离线</Badge>
                            ) : (
                              <Badge tone="warning">未激活</Badge>
                            )}
                          </Td>
                          <Td className="text-xs text-muted">{d.lastHeartbeatAt ? d.lastHeartbeatAt.slice(0, 19).replace('T', ' ') : '-'}</Td>
                          <Td className="text-right">
                            <Link to={`/admin/devices/${d.id}`}>
                              <Button size="sm">查看详情</Button>
                            </Link>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          )}

          {tab === 'stats' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-border bg-bg/20 p-4">
                <div className="text-xs text-muted">总告警</div>
                <div className="mt-1 text-2xl font-semibold">{stats?.total ?? '-'}</div>
              </div>
              <div className="rounded-2xl border border-border bg-bg/20 p-4">
                <div className="text-xs text-muted">待处理</div>
                <div className="mt-1 text-2xl font-semibold">{stats?.pending ?? '-'}</div>
              </div>
              <div className="rounded-2xl border border-border bg-bg/20 p-4">
                <div className="text-xs text-muted">处理中</div>
                <div className="mt-1 text-2xl font-semibold">{stats?.processing ?? '-'}</div>
              </div>
              <div className="rounded-2xl border border-border bg-bg/20 p-4">
                <div className="text-xs text-muted">已处理</div>
                <div className="mt-1 text-2xl font-semibold">{stats?.resolved ?? '-'}</div>
              </div>
            </div>
          )}

          {loading && <div className="mt-3 text-xs text-muted">加载中...</div>}
        </CardBody>
      </Card>

      <Modal
        open={editOpen}
        title={form?.name ? '编辑用户' : '新增用户'}
        onClose={() => setEditOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setEditOpen(false)}>取消</Button>
            <Button variant="primary" onClick={submitUser} disabled={loading}>
              保存
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>用户名</Label>
            <Input value={form?.name ?? ''} onChange={(e) => setForm((p) => (p ? { ...p, name: e.target.value } : p))} />
          </div>
          <div className="space-y-2">
            <Label>手机号（登录账号）</Label>
            <Input value={form?.phone ?? ''} onChange={(e) => setForm((p) => (p ? { ...p, phone: e.target.value } : p))} />
          </div>
          <div className="space-y-2">
            <Label>角色</Label>
            <Select value={form?.role ?? 'OrgUser'} onChange={(e) => setForm((p) => (p ? { ...p, role: e.target.value as Role } : p))}>
              <option value="OrgAdmin">组织管理员</option>
              <option value="OrgUser">组织用户</option>
            </Select>
            <Hint>角色变更在刷新/下次登录生效（原型）</Hint>
          </div>
          <div className="space-y-2">
            <Label>状态</Label>
            <Select value={form?.status ?? 'Enabled'} onChange={(e) => setForm((p) => (p ? { ...p, status: e.target.value as AppUser['status'] } : p))}>
              <option value="Enabled">启用</option>
              <option value="Disabled">停用</option>
            </Select>
          </div>
        </div>
        {editError && <div className="mt-3"><ErrorText>{editError}</ErrorText></div>}
      </Modal>

      <Confirm
        open={confirmOpen}
        title={confirmTarget?.status === 'Enabled' ? '确认停用用户？' : '确认启用用户？'}
        description={confirmTarget?.status === 'Enabled' ? '停用的用户无法登录 Admin 系统及告警 APP。' : '启用后用户可再次登录与处置告警。'}
        confirmText={confirmTarget?.status === 'Enabled' ? '确认停用' : '确认启用'}
        danger={confirmTarget?.status === 'Enabled'}
        onConfirm={doToggle}
        onClose={() => setConfirmOpen(false)}
      />

      <Modal
        open={resetOpen}
        title="重置密码"
        onClose={() => setResetOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setResetOpen(false)}>关闭</Button>
            <Button variant="primary" onClick={doReset} disabled={loading}>
              生成默认密码
            </Button>
          </div>
        }
      >
        <div className="space-y-2 text-sm">
          <div className="text-muted">用户：{resetTarget?.name}</div>
          <div className="text-muted">默认密码示例：guardx_pass1234!</div>
          {resetResult && <div className="rounded-xl border border-border bg-bg/20 p-3 font-semibold text-fg">{resetResult}</div>}
        </div>
      </Modal>
    </div>
  )
}
