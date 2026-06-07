import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../app/auth/useAuth'
import { useToast } from '../../app/toast/useToast'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { ErrorText, Hint, Input, Label, Select, Textarea } from '../../components/Field'
import { Confirm, Modal } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { Table, Td, Th, Tr } from '../../components/Table'
import { Tabs } from '../../components/Tabs'
import { createId } from '../../lib/id'
import { formatCoord } from '../../lib/coords'
import type { AppUser, Role } from '../../types/auth'
import type { Alarm, Batch, BatchDeviceItem, Device, Org } from '../../types/models'
import {
  bindBatchDevices,
  bindDevicesBulk,
  bindDevice,
  getOrg,
  getDevice,
  listAlarms,
  listAllDevicesByOrg,
  listAllUsersByOrg,
  listBatches,
  listBatchDevices,
  resetUserPassword,
  toggleUserStatus,
  upsertUser,
} from '../../mocks/api'

function roleLabel(role: Role) {
  if (role === 'SystemAdmin') return '系统管理员'
  if (role === 'OrgAdmin') return '组织管理员'
  return '组织用户'
}

const alarmsPageSize = 10
const batchSelectPageSize = 8

function alarmTypeTone(type: string) {
  if (type.includes('车')) return 'info' as const
  if (type.includes('无人机')) return 'warning' as const
  return 'danger' as const
}

function alarmTypeLabel(type: string) {
  if (type.includes('车')) return '车辆'
  if (type.includes('无人机')) return '无人机'
  return '人员'
}

function alarmTypeTagClass(tone: ReturnType<typeof alarmTypeTone>) {
  if (tone === 'info') return 'border-transparent bg-status-info text-white'
  if (tone === 'warning') return 'border-transparent bg-status-warning text-white'
  return 'border-transparent bg-status-danger text-white'
}

function statusBadge(status: Alarm['status']) {
  if (status === 'Pending') return <Badge tone="danger">待处理</Badge>
  if (status === 'Processing') return <Badge tone="warning">处理中</Badge>
  return <Badge tone="success">已处理</Badge>
}

export function OrgDetailPage() {
  const { orgId: routeOrgId } = useParams()
  const orgId = routeOrgId ?? ''
  const toast = useToast()
  const { user } = useAuth()

  const [sp] = useSearchParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = sp.get('tab') ?? 'users'
  const tab = rawTab === 'stats' ? 'alarms' : rawTab

  const canSee = user?.role === 'SystemAdmin' || user?.orgId === orgId
  const canManageUsers = user?.role === 'SystemAdmin' || user?.role === 'OrgAdmin'
  const canManageDevices = user?.role === 'SystemAdmin' || user?.role === 'OrgAdmin'

  const [org, setOrg] = useState<Org | null>(null)
  const [orgError, setOrgError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [users, setUsers] = useState<AppUser[]>([])
  const [devices, setDevices] = useState<Device[]>([])

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

  const [bindOpen, setBindOpen] = useState(false)
  const [bindMode, setBindMode] = useState<'single' | 'batch'>('single')
  const [bindError, setBindError] = useState<string | null>(null)

  const [bindDeviceId, setBindDeviceId] = useState('')
  const [bindDeviceName, setBindDeviceName] = useState('')
  const [bindLocation, setBindLocation] = useState('')
  const [bindNote, setBindNote] = useState('')
  const [bindDeviceChecking, setBindDeviceChecking] = useState(false)
  const [bindDevicePreview, setBindDevicePreview] = useState<Device | null>(null)

  const [batches, setBatches] = useState<Batch[]>([])
  const [bindBatchId, setBindBatchId] = useState('')
  const [bindBatchCount, setBindBatchCount] = useState(10)
  const [bindBatchQ, setBindBatchQ] = useState('')
  const [bindBatchPage, setBindBatchPage] = useState(1)
  const [bindBatchLoading, setBindBatchLoading] = useState(false)
  const [bindBatchError, setBindBatchError] = useState<string | null>(null)
  const [bindBatchItems, setBindBatchItems] = useState<BatchDeviceItem[]>([])
  const [bindBatchTotal, setBindBatchTotal] = useState(0)
  const [bindBatchSelected, setBindBatchSelected] = useState<string[]>([])

  const [aQ, setAQ] = useState('')
  const [aTimePreset, setATimePreset] = useState<'Today' | '7d' | '30d'>('Today')
  const [aStatus, setAStatus] = useState<'All' | Alarm['status']>('All')
  const [aPage, setAPage] = useState(1)
  const [aLoading, setALoading] = useState(false)
  const [aError, setAError] = useState<string | null>(null)
  const [aItems, setAItems] = useState<Alarm[]>([])
  const [aTotal, setATotal] = useState(0)
  const [aDetailOpen, setADetailOpen] = useState(false)
  const [aDetail, setADetail] = useState<Alarm | null>(null)

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
        const [u, d] = await Promise.all([listAllUsersByOrg(orgId), listAllDevicesByOrg(orgId)])
        if (!alive) return
        setUsers(u)
        setDevices(d)
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

  useEffect(() => {
    if (!bindOpen) return
    let alive = true
    const run = async () => {
      try {
        const res = await listBatches({ page: 1, pageSize: 50, status: 'All' })
        if (!alive) return
        setBatches(res.items)
      } catch {
        if (alive) setBatches([])
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [bindOpen])

  const effectiveBindBatchQ = useMemo(() => bindBatchQ.trim(), [bindBatchQ])

  useEffect(() => {
    if (!bindOpen || bindMode !== 'batch' || !bindBatchId.trim()) return
    let alive = true
    const run = async () => {
      setBindBatchLoading(true)
      setBindBatchError(null)
      try {
        const res = await listBatchDevices(bindBatchId, {
          q: effectiveBindBatchQ,
          bind: 'Unbound',
          page: bindBatchPage,
          pageSize: batchSelectPageSize,
        })
        if (!alive) return
        setBindBatchItems(res.items)
        setBindBatchTotal(res.total)
      } catch (e) {
        const msg = e instanceof Error ? e.message : '加载失败'
        if (!alive) return
        setBindBatchError(msg)
      } finally {
        if (alive) setBindBatchLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [bindOpen, bindMode, bindBatchId, effectiveBindBatchQ, bindBatchPage])

  const effectiveAQ = useMemo(() => aQ.trim(), [aQ])

  useEffect(() => {
    if (tab !== 'alarms' || !canSee) return
    let alive = true
    const run = async () => {
      setALoading(true)
      setAError(null)
      try {
        const res = await listAlarms({
          q: effectiveAQ,
          level: 'All',
          status: aStatus,
          timePreset: aTimePreset,
          orgId,
          page: aPage,
          pageSize: alarmsPageSize,
        })
        if (!alive) return
        setAItems(res.items)
        setATotal(res.total)
      } catch (e) {
        const msg = e instanceof Error ? e.message : '加载失败'
        if (!alive) return
        setAError(msg)
      } finally {
        if (alive) setALoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [tab, canSee, orgId, effectiveAQ, aStatus, aTimePreset, aPage])

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

  const openBind = () => {
    setBindError(null)
    setBindMode('single')
    setBindDeviceId('')
    setBindDeviceName('')
    setBindLocation('')
    setBindNote('')
    setBindDeviceChecking(false)
    setBindDevicePreview(null)
    setBindBatchId('')
    setBindBatchCount(10)
    setBindBatchQ('')
    setBindBatchPage(1)
    setBindBatchLoading(false)
    setBindBatchError(null)
    setBindBatchItems([])
    setBindBatchTotal(0)
    setBindBatchSelected([])
    setBindOpen(true)
  }

  const refreshDevices = async () => {
    const next = await listAllDevicesByOrg(orgId)
    setDevices(next)
  }

  const checkBindDevice = async (deviceId: string) => {
    const id = deviceId.trim()
    if (!id) return
    setBindDeviceChecking(true)
    setBindDevicePreview(null)
    setBindError(null)
    try {
      const d = await getDevice(id)
      setBindDevicePreview(d)
      if (d.orgId) {
        setBindError('设备 ID 无效或已被占用')
        return
      }
      setBindDeviceName((p) => (p.trim() ? p : d.name || `设备 ${id.slice(-4)}`))
      setBindLocation((p) => (p.trim() ? p : d.location || ''))
      setBindNote((p) => (p.trim() ? p : d.note || ''))
    } catch (e) {
      const msg = e instanceof Error ? e.message : '校验失败'
      setBindError(msg)
    } finally {
      setBindDeviceChecking(false)
    }
  }

  const submitBindSingle = async () => {
    setBindError(null)
    if (!bindDeviceId.trim()) return setBindError('请填写设备 ID')
    if (!bindDeviceName.trim()) return setBindError('请填写设备名称')
    try {
      setLoading(true)
      await bindDevice({
        deviceId: bindDeviceId.trim(),
        name: bindDeviceName.trim(),
        orgId,
        location: bindLocation.trim(),
        note: bindNote.trim(),
      })
      toast.push('success', '绑定成功，设备状态已变更为离线')
      setBindOpen(false)
      await refreshDevices()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '绑定失败'
      setBindError(msg)
      toast.push('error', msg)
    } finally {
      setLoading(false)
    }
  }

  const submitBindBatchQuick = async () => {
    setBindError(null)
    if (!bindBatchId.trim()) return setBindError('请选择批次')
    if (!Number.isFinite(bindBatchCount) || bindBatchCount <= 0) return setBindError('请填写正确的绑定数量')
    try {
      setLoading(true)
      const res = await bindBatchDevices({ batchId: bindBatchId, orgId, count: Math.floor(bindBatchCount) })
      toast.push('success', `已绑定 ${res.bound} 台设备`)
      setBindOpen(false)
      await refreshDevices()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '绑定失败'
      setBindError(msg)
      toast.push('error', msg)
    } finally {
      setLoading(false)
    }
  }

  const submitBindBatchSelected = async () => {
    setBindError(null)
    if (!bindBatchId.trim()) return setBindError('请选择批次')
    if (bindBatchSelected.length === 0) return setBindError('请先选择要绑定的设备')
    try {
      setLoading(true)
      const res = await bindDevicesBulk({ deviceIds: bindBatchSelected, orgId })
      const failedCount = res.failed.length
      if (res.bound > 0) toast.push('success', failedCount ? `已绑定 ${res.bound} 台，失败 ${failedCount} 台` : `已绑定 ${res.bound} 台设备`)
      if (failedCount) {
        setBindError(`部分设备绑定失败（${failedCount}）`)
      } else {
        setBindOpen(false)
      }
      setBindBatchSelected([])
      await refreshDevices()
      setBindBatchPage(1)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '绑定失败'
      setBindError(msg)
      toast.push('error', msg)
    } finally {
      setLoading(false)
    }
  }

  const openAlarmDetail = (a: Alarm) => {
    setADetail(a)
    setADetailOpen(true)
  }

  const setTab = (t: string) => {
    if (t === 'alarms') setAPage(1)
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
              { value: 'alarms', label: '告警列表' },
            ]}
            onChange={setTab}
          />
          {tab === 'users' && canManageUsers && (
            <Button variant="primary" onClick={openCreateUser}>
              新增用户
            </Button>
          )}
          {tab === 'devices' && canManageDevices && (
            <Button variant="primary" onClick={openBind}>
              绑定设备
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
                      <Th>位置信息</Th>
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
                          <Td className="text-xs text-muted">
                            {d.coords ? formatCoord(d.coords.lat, d.coords.lng) : '-'}
                          </Td>
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

          {tab === 'alarms' && (
            <div className="space-y-3">
              <Tabs
                value={aStatus}
                options={[
                  { value: 'All', label: '全部' },
                  { value: 'Pending', label: '待处理' },
                  { value: 'Processing', label: '处理中' },
                  { value: 'Resolved', label: '已处理' },
                ]}
                onChange={(v) => {
                  setAStatus(v as Alarm['status'] | 'All')
                  setAPage(1)
                }}
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label>设备搜索</Label>
                  <Input
                    value={aQ}
                    onChange={(e) => {
                      setAQ(e.target.value)
                      setAPage(1)
                    }}
                    placeholder="设备名称 / 设备 ID"
                  />
                  <Hint>仅展示本组织下告警</Hint>
                </div>
                <div className="space-y-2">
                  <Label>时间范围</Label>
                  <Select
                    value={aTimePreset}
                    onChange={(e) => {
                      setATimePreset(e.target.value as 'Today' | '7d' | '30d')
                      setAPage(1)
                    }}
                  >
                    <option value="Today">今日</option>
                    <option value="7d">近 7 天</option>
                    <option value="30d">近 30 天</option>
                  </Select>
                </div>
              </div>

              {aError && <ErrorText>{aError}</ErrorText>}

              <div className="rounded-2xl border border-border">
                <Table>
                  <thead>
                    <tr>
                      <Th>告警哨兵 ID</Th>
                      <Th>触发时间</Th>
                      <Th>告警类型</Th>
                      <Th>触发设备</Th>
                      <Th>位置信息</Th>
                      <Th>处理状态</Th>
                      <Th>处理人</Th>
                      <Th className="text-right">操作</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {aLoading ? (
                      <tr>
                        <Td colSpan={8} className="py-10 text-center text-muted">
                          加载中...
                        </Td>
                      </tr>
                    ) : aItems.length === 0 ? (
                      <tr>
                        <Td colSpan={8} className="py-10 text-center text-muted">
                          暂无数据
                        </Td>
                      </tr>
                    ) : (
                      aItems.map((a) => (
                        <Tr key={a.id}>
                          <Td className="font-medium">{a.deviceId}</Td>
                          <Td className="text-xs text-muted">{a.occurredAt.slice(0, 19).replace('T', ' ')}</Td>
                          <Td>
                            <Badge tone={alarmTypeTone(a.type)} className={alarmTypeTagClass(alarmTypeTone(a.type))}>
                              {alarmTypeLabel(a.type)}
                            </Badge>
                          </Td>
                          <Td className="text-xs text-muted">
                            {a.deviceName}
                            <div className="text-[11px] text-muted">{a.deviceId}</div>
                          </Td>
                          <Td className="text-xs text-muted">{a.location ?? '-'}</Td>
                          <Td>{statusBadge(a.status)}</Td>
                          <Td className="text-xs text-muted">{a.handler ?? '-'}</Td>
                          <Td className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => openAlarmDetail(a)}>
                                查看
                              </Button>
                            </div>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              <Pagination page={aPage} pageSize={alarmsPageSize} total={aTotal} onPageChange={setAPage} />
            </div>
          )}

          {loading && <div className="mt-3 text-xs text-muted">加载中...</div>}
        </CardBody>
      </Card>

      <Modal
        open={bindOpen}
        title="绑定设备"
        onClose={() => setBindOpen(false)}
        footer={
          bindMode === 'single' ? (
            <div className="flex justify-end gap-2">
              <Button onClick={() => setBindOpen(false)} disabled={loading || bindDeviceChecking}>
                取消
              </Button>
              <Button
                variant="primary"
                onClick={submitBindSingle}
                disabled={loading || bindDeviceChecking || Boolean(bindDevicePreview?.orgId)}
              >
                确认绑定
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button onClick={() => setBindOpen(false)} disabled={loading || bindBatchLoading}>
                取消
              </Button>
              <Button
                onClick={submitBindBatchQuick}
                disabled={loading || bindBatchLoading || !bindBatchId.trim() || !Number.isFinite(bindBatchCount) || bindBatchCount <= 0}
              >
                快速绑定
              </Button>
              <Button
                variant="primary"
                onClick={submitBindBatchSelected}
                disabled={loading || bindBatchLoading || !bindBatchId.trim() || bindBatchSelected.length === 0}
              >
                绑定已选（{bindBatchSelected.length}）
              </Button>
            </div>
          )
        }
      >
        <div className="space-y-3">
          <Tabs
            value={bindMode}
            options={[
              { value: 'single', label: '单设备绑定' },
              { value: 'batch', label: '按批次添加' },
            ]}
            onChange={(v) => {
              setBindMode(v as 'single' | 'batch')
              setBindError(null)
            }}
          />

          {bindMode === 'single' ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>设备 ID（必填）</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={bindDeviceId}
                    onChange={(e) => {
                      setBindDeviceId(e.target.value)
                      setBindDevicePreview(null)
                      setBindError(null)
                    }}
                    onBlur={(e) => checkBindDevice(e.target.value)}
                    placeholder="GuardXV1202605_0004"
                  />
                  <Button size="sm" onClick={() => checkBindDevice(bindDeviceId)} disabled={bindDeviceChecking || !bindDeviceId.trim()}>
                    {bindDeviceChecking ? '校验中' : '校验'}
                  </Button>
                </div>
                <Hint>支持自动校验并预填信息；已占用会提示</Hint>
              </div>
              <div className="space-y-2">
                <Label>设备名称（必填）</Label>
                <Input value={bindDeviceName} onChange={(e) => setBindDeviceName(e.target.value)} placeholder="南门主通道哨兵" />
              </div>
              <div className="space-y-2">
                <Label>安装位置（选填）</Label>
                <Input value={bindLocation} onChange={(e) => setBindLocation(e.target.value)} placeholder="南门主通道" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>设备备注（选填）</Label>
                <Textarea value={bindNote} onChange={(e) => setBindNote(e.target.value)} placeholder="记录安装人员、特殊配置要求等" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>选择批次（必填）</Label>
                  <Select
                    value={bindBatchId}
                    onChange={(e) => {
                      setBindBatchId(e.target.value)
                      setBindBatchSelected([])
                      setBindBatchQ('')
                      setBindBatchPage(1)
                      setBindError(null)
                    }}
                  >
                    <option value="">请选择</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id}
                      </option>
                    ))}
                  </Select>
                  <Hint>仅展示该批次未绑定设备</Hint>
                </div>
                <div className="space-y-2">
                  <Label>设备搜索</Label>
                  <Input
                    value={bindBatchQ}
                    onChange={(e) => {
                      setBindBatchQ(e.target.value)
                      setBindBatchPage(1)
                    }}
                    placeholder="输入设备 ID 关键词"
                    disabled={!bindBatchId.trim()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>快速绑定数量</Label>
                  <Input
                    type="number"
                    min={1}
                    value={String(bindBatchCount)}
                    onChange={(e) => setBindBatchCount(Number(e.target.value))}
                    placeholder="10"
                    disabled={!bindBatchId.trim()}
                  />
                  <Hint>按序绑定前 N 台（无需勾选）</Hint>
                </div>
              </div>

              {bindBatchError && <ErrorText>{bindBatchError}</ErrorText>}

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted">已选择 {bindBatchSelected.length} 台</div>
                {bindBatchSelected.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => setBindBatchSelected([])}>
                    清空选择
                  </Button>
                )}
              </div>

              <div className="rounded-2xl border border-border">
                <Table>
                  <thead>
                    <tr>
                      <Th className="w-10">
                        <input
                          type="checkbox"
                          checked={
                            bindBatchItems.length > 0 &&
                            bindBatchItems.every((it) => bindBatchSelected.includes(it.deviceId))
                          }
                          onChange={(e) => {
                            const ids = bindBatchItems.map((it) => it.deviceId)
                            setBindBatchSelected((prev) => {
                              const set = new Set(prev)
                              if (e.target.checked) ids.forEach((id) => set.add(id))
                              else ids.forEach((id) => set.delete(id))
                              return Array.from(set)
                            })
                          }}
                          disabled={bindBatchLoading || bindBatchItems.length === 0}
                        />
                      </Th>
                      <Th>设备 ID</Th>
                      <Th>在线状态</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {bindBatchLoading ? (
                      <tr>
                        <Td colSpan={3} className="py-10 text-center text-muted">
                          加载中...
                        </Td>
                      </tr>
                    ) : !bindBatchId.trim() ? (
                      <tr>
                        <Td colSpan={3} className="py-10 text-center text-muted">
                          请选择批次
                        </Td>
                      </tr>
                    ) : bindBatchItems.length === 0 ? (
                      <tr>
                        <Td colSpan={3} className="py-10 text-center text-muted">
                          暂无可绑定设备
                        </Td>
                      </tr>
                    ) : (
                      bindBatchItems.map((it) => (
                        <Tr key={it.deviceId}>
                          <Td className="w-10">
                            <input
                              type="checkbox"
                              checked={bindBatchSelected.includes(it.deviceId)}
                              onChange={(e) => {
                                setBindBatchSelected((prev) => {
                                  const set = new Set(prev)
                                  if (e.target.checked) set.add(it.deviceId)
                                  else set.delete(it.deviceId)
                                  return Array.from(set)
                                })
                              }}
                            />
                          </Td>
                          <Td className="font-medium">{it.deviceId}</Td>
                          <Td>
                            {it.onlineStatus === 'Online' ? (
                              <Badge tone="success">在线</Badge>
                            ) : it.onlineStatus === 'Offline' ? (
                              <Badge tone="muted">离线</Badge>
                            ) : (
                              <Badge tone="warning">未激活</Badge>
                            )}
                          </Td>
                        </Tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              <Pagination
                page={bindBatchPage}
                pageSize={batchSelectPageSize}
                total={bindBatchTotal}
                onPageChange={setBindBatchPage}
              />
            </div>
          )}

          {bindMode === 'single' && bindDevicePreview && (
            <div className="rounded-2xl border border-border bg-bg/20 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{bindDevicePreview.id}</div>
                {bindDevicePreview.orgId ? <Badge tone="danger">已绑定</Badge> : <Badge tone="success">可绑定</Badge>}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted">
                <div>型号</div>
                <div className="text-fg">{bindDevicePreview.model}</div>
                <div>批次</div>
                <div className="text-fg">{bindDevicePreview.batchId ?? '-'}</div>
                <div>状态</div>
                <div className="text-fg">{bindDevicePreview.onlineStatus}</div>
              </div>
            </div>
          )}

          {bindError && <ErrorText>{bindError}</ErrorText>}
        </div>
      </Modal>

      <Modal
        open={aDetailOpen}
        title="告警详情"
        onClose={() => setADetailOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setADetailOpen(false)}>关闭</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-bg/20 p-4">
              <div className="text-xs text-muted">基础信息</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted">告警编号</div>
                <div className="font-semibold">{aDetail?.id ?? '-'}</div>
                <div className="text-muted">时间</div>
                <div className="font-semibold">{aDetail?.occurredAt ? aDetail.occurredAt.slice(0, 19).replace('T', ' ') : '-'}</div>
                <div className="text-muted">类型</div>
                <div className="font-semibold">{aDetail?.type ?? '-'}</div>
                <div className="text-muted">状态</div>
                <div className="font-semibold">{aDetail ? statusBadge(aDetail.status) : '-'}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-bg/20 p-4">
              <div className="text-xs text-muted">上下文（占位）</div>
              <div className="mt-2 text-sm">
                <div className="text-muted">触发设备</div>
                <div className="font-semibold">{aDetail?.deviceName ?? '-'}</div>
                <div className="mt-2 text-muted">位置信息</div>
                <div className="font-semibold">{aDetail?.location ?? '-'}</div>
              </div>
              <div className="mt-3 flex h-[140px] items-center justify-center rounded-xl border border-border bg-bg/30 text-xs text-muted">
                抓拍图片 / 短视频占位
              </div>
            </div>
          </div>
        </div>
      </Modal>

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
