import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../app/auth/useAuth'
import { useToast } from '../../app/toast/useToast'
import { Badge, StatusDot } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { ErrorText, Hint, Input, Label, Select, Textarea } from '../../components/Field'
import { Confirm, Modal } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { Table, Td, Th, Tr } from '../../components/Table'
import type { Org } from '../../types/models'
import type { Device, DeviceOnlineStatus } from '../../types/models'
import { getDevice, listAllOrgs, listDevices, unbindDevice, updateDevice } from '../../mocks/api'

const pageSize = 10

function statusView(status: DeviceOnlineStatus) {
  if (status === 'Online') {
    return (
      <Badge tone="success">
        <StatusDot tone="success" />
        在线
      </Badge>
    )
  }
  if (status === 'Offline') {
    return (
      <Badge tone="muted">
        <StatusDot tone="muted" />
        离线
      </Badge>
    )
  }
  return (
    <Badge tone="warning">
      <StatusDot tone="warning" />
      未激活
    </Badge>
  )
}

export function DevicesListPage() {
  const toast = useToast()
  const { user } = useAuth()

  const canManage = user?.role === 'SystemAdmin' || user?.role === 'OrgAdmin'

  const [orgs, setOrgs] = useState<Org[]>([])
  const [q, setQ] = useState('')
  const [onlineStatus, setOnlineStatus] = useState<'All' | DeviceOnlineStatus>('All')
  const [orgId, setOrgId] = useState<'All' | string>('All')
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Device[]>([])
  const [total, setTotal] = useState(0)

  const [editOpen, setEditOpen] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [form, setForm] = useState<Device | null>(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<Device | null>(null)

  useEffect(() => {
    let alive = true
    listAllOrgs()
      .then((res) => {
        if (!alive) return
        setOrgs(res)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const effectiveQ = useMemo(() => q.trim(), [q])

  const effectiveOrg = user?.role === 'SystemAdmin' ? orgId : user?.orgId ?? 'All'

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await listDevices({
          q: effectiveQ,
          onlineStatus,
          orgId: effectiveOrg,
          page,
          pageSize,
        })
        if (!alive) return
        setItems(res.items)
        setTotal(res.total)
      } catch (e) {
        const msg = e instanceof Error ? e.message : '加载失败'
        if (!alive) return
        setError(msg)
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [effectiveQ, onlineStatus, effectiveOrg, page])

  const orgName = (id?: string) => orgs.find((o) => o.id === id)?.name ?? '-'

  const openEdit = async (deviceId: string) => {
    setEditError(null)
    try {
      setLoading(true)
      const d = await getDevice(deviceId)
      setForm(d)
      setEditOpen(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '加载失败'
      toast.push('error', msg)
    } finally {
      setLoading(false)
    }
  }

  const submit = async () => {
    if (!form) return
    setEditError(null)
    if (!form.name.trim()) return setEditError('请填写设备名称')
    try {
      setLoading(true)
      await updateDevice({ id: form.id, name: form.name, location: form.location, note: form.note })
      toast.push('success', '保存成功')
      setEditOpen(false)
      setPage(1)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '保存失败'
      setEditError(msg)
      toast.push('error', msg)
    } finally {
      setLoading(false)
    }
  }

  const askUnbind = (d: Device) => {
    setConfirmTarget(d)
    setConfirmOpen(true)
  }

  const doUnbind = async () => {
    if (!confirmTarget) return
    try {
      setLoading(true)
      await unbindDevice(confirmTarget.id)
      toast.push('success', '解绑成功（历史告警保留）')
      setConfirmOpen(false)
      setPage(1)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '操作失败'
      toast.push('error', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <div className="text-base font-semibold">设备列表</div>
            <div className="text-xs text-muted">支持搜索、筛选、分页</div>
          </div>
          <Link to="/admin/devices/new">
            <Button variant="primary">新增设备</Button>
          </Link>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label>设备搜索</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="设备 ID / 设备名称" />
              <Hint>支持模糊查询</Hint>
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={onlineStatus}
                onChange={(e) => setOnlineStatus(e.target.value as DeviceOnlineStatus | 'All')}
              >
                <option value="All">全部</option>
                <option value="Online">在线</option>
                <option value="Offline">离线</option>
                <option value="Unactivated">未激活</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>组织</Label>
              <Select
                value={effectiveOrg}
                disabled={user?.role !== 'SystemAdmin'}
                onChange={(e) => setOrgId(e.target.value)}
              >
                <option value="All">全部</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
              <Hint>组织管理员默认仅看本组织</Hint>
            </div>
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          <div className="rounded-2xl border border-border">
            <Table>
              <thead>
                <tr>
                  <Th>设备 ID</Th>
                  <Th>设备名称</Th>
                  <Th>归属组织</Th>
                  <Th>在线状态</Th>
                  <Th>电量/网络</Th>
                  <Th>最后心跳</Th>
                  <Th className="text-right">操作</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <Td colSpan={7} className="py-10 text-center text-muted">
                      加载中...
                    </Td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <Td colSpan={7} className="py-10 text-center text-muted">
                      暂无数据
                    </Td>
                  </tr>
                ) : (
                  items.map((d) => (
                    <Tr key={d.id}>
                      <Td className="font-medium">{d.id}</Td>
                      <Td>{d.name}</Td>
                      <Td className="text-xs text-muted">{d.orgId ? orgName(d.orgId) : '-'}</Td>
                      <Td>{statusView(d.onlineStatus)}</Td>
                      <Td className="text-xs text-muted">
                        {d.model === 'HVS-3.0' ? `${d.batteryPercent ?? '-'}% / ${d.networkType ?? '-'}` : '-'}
                      </Td>
                      <Td className="text-xs text-muted">{d.lastHeartbeatAt ? d.lastHeartbeatAt.slice(0, 19).replace('T', ' ') : '-'}</Td>
                      <Td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/admin/devices/${d.id}`}>
                            <Button size="sm">查看详情</Button>
                          </Link>
                          <Button size="sm" onClick={() => openEdit(d.id)} disabled={!canManage}>
                            编辑
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => askUnbind(d)} disabled={!canManage || !d.orgId}>
                            解绑
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </CardBody>
      </Card>

      <Modal
        open={editOpen}
        title="编辑设备"
        onClose={() => setEditOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setEditOpen(false)}>取消</Button>
            <Button variant="primary" onClick={submit} disabled={loading}>
              保存
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>设备名称</Label>
            <Input value={form?.name ?? ''} onChange={(e) => setForm((p) => (p ? { ...p, name: e.target.value } : p))} />
          </div>
          <div className="space-y-2">
            <Label>安装位置</Label>
            <Input value={form?.location ?? ''} onChange={(e) => setForm((p) => (p ? { ...p, location: e.target.value } : p))} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>备注</Label>
            <Textarea value={form?.note ?? ''} onChange={(e) => setForm((p) => (p ? { ...p, note: e.target.value } : p))} />
          </div>
        </div>
        {editError && <div className="mt-3"><ErrorText>{editError}</ErrorText></div>}
      </Modal>

      <Confirm
        open={confirmOpen}
        title="确认解绑设备？"
        description="解绑后设备状态变更为“未分配”，历史告警数据保留，但不再产生新业务数据。"
        confirmText="确认解绑"
        danger
        onConfirm={doUnbind}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}
