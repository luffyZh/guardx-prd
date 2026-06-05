import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useToast } from '../../app/toast/useToast'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { ErrorText, Input, Label, Textarea } from '../../components/Field'
import { Modal } from '../../components/Modal'
import { Table, Td, Th, Tr } from '../../components/Table'
import type { Alarm, Device } from '../../types/models'
import { getDevice, listAlarms, updateDevice } from '../../mocks/api'

export function DeviceDetailPage() {
  const { deviceId } = useParams()
  const id = deviceId ?? ''
  const toast = useToast()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [device, setDevice] = useState<Device | null>(null)
  const [alarms, setAlarms] = useState<Alarm[]>([])

  const [editOpen, setEditOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formNote, setFormNote] = useState('')

  const statusBadge = useMemo(() => {
    if (!device) return null
    if (device.onlineStatus === 'Online') return <Badge tone="success">在线</Badge>
    if (device.onlineStatus === 'Offline') return <Badge tone="muted">离线</Badge>
    return <Badge tone="warning">未激活</Badge>
  }, [device])

  const logTimes = useMemo(() => {
    const base = device?.lastHeartbeatAt ?? device?.bindAt ?? '2026-06-04T00:00:00.000Z'
    const baseMs = Number.isFinite(Date.parse(base)) ? Date.parse(base) : Date.parse('2026-06-04T00:00:00.000Z')
    return Array.from({ length: 6 }).map((_, i) =>
      new Date(baseMs - i * 3600_000).toISOString().slice(0, 19).replace('T', ' '),
    )
  }, [device?.lastHeartbeatAt, device?.bindAt])

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const d = await getDevice(id)
        const res = await listAlarms({
          q: id,
          level: 'All',
          status: 'All',
          timePreset: '7d',
          orgId: 'All',
          page: 1,
          pageSize: 10,
        })
        if (!alive) return
        setDevice(d)
        setAlarms(res.items)
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
  }, [id])

  const openEdit = () => {
    if (!device) return
    setFormName(device.name)
    setFormLocation(device.location ?? '')
    setFormNote(device.note ?? '')
    setEditOpen(true)
  }

  const submit = async () => {
    if (!device) return
    if (!formName.trim()) {
      toast.push('error', '请填写设备名称')
      return
    }
    try {
      setLoading(true)
      await updateDevice({
        id: device.id,
        name: formName.trim(),
        location: formLocation.trim(),
        note: formNote.trim(),
      })
      toast.push('success', '保存成功')
      setEditOpen(false)
      const d = await getDevice(device.id)
      const res = await listAlarms({
        q: device.id,
        level: 'All',
        status: 'All',
        timePreset: '7d',
        orgId: 'All',
        page: 1,
        pageSize: 10,
      })
      setDevice(d)
      setAlarms(res.items)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '保存失败'
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
            <div className="text-base font-semibold">设备详情</div>
            <div className="text-xs text-muted">{device?.id ?? id}</div>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/devices">
              <Button size="sm">返回列表</Button>
            </Link>
            <Button size="sm" onClick={openEdit} disabled={!device}>
              编辑
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          {error && <ErrorText>{error}</ErrorText>}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-bg/20 p-4">
              <div className="text-xs text-muted">基础信息</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted">名称</div>
                <div className="font-semibold">{device?.name ?? '-'}</div>
                <div className="text-muted">型号</div>
                <div className="font-semibold">{device?.model ?? '-'}</div>
                <div className="text-muted">所属批次</div>
                <div className="font-semibold">{device?.batchId ?? '-'}</div>
                <div className="text-muted">绑定时间</div>
                <div className="font-semibold">{device?.bindAt ? device.bindAt.slice(0, 19).replace('T', ' ') : '-'}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg/20 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted">实时状态</div>
                {statusBadge}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted">IP</div>
                <div className="font-semibold">{device?.ip ?? '-'}</div>
                <div className="text-muted">网络类型</div>
                <div className="font-semibold">{device?.networkType ?? '-'}</div>
                <div className="text-muted">电量</div>
                <div className="font-semibold">{device?.batteryPercent != null ? `${device.batteryPercent}%` : '-'}</div>
                <div className="text-muted">固件版本</div>
                <div className="font-semibold">{device?.firmwareVersion ?? '-'}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg/20 p-4">
              <div className="text-xs text-muted">位置信息</div>
              <div className="mt-2 text-sm font-semibold">{device?.location ?? '-'}</div>
              <div className="mt-3 text-xs text-muted">（可选）地图组件占位</div>
              <div className="mt-2 flex h-[92px] items-center justify-center rounded-xl border border-border bg-bg/30 text-xs text-muted">
                Map Placeholder
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-border">
              <div className="flex items-center justify-between border-b border-border p-4">
                <div className="text-sm font-semibold">最近告警（5-10 条）</div>
                <Link to={`/admin/alarms?q=${encodeURIComponent(id)}`}>
                  <Button size="sm">查看更多</Button>
                </Link>
              </div>
              <div className="p-4">
                <Table>
                  <thead>
                    <tr>
                      <Th>时间</Th>
                      <Th>类型</Th>
                      <Th>状态</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {alarms.length === 0 ? (
                      <tr>
                        <Td colSpan={3} className="py-6 text-center text-muted">
                          暂无告警
                        </Td>
                      </tr>
                    ) : (
                      alarms.slice(0, 8).map((a) => (
                        <Tr key={a.id}>
                          <Td className="text-xs text-muted">{a.occurredAt.slice(0, 19).replace('T', ' ')}</Td>
                          <Td className="font-medium">{a.type}</Td>
                          <Td>
                            {a.status === 'Pending' ? (
                              <Badge tone="danger">待处理</Badge>
                            ) : a.status === 'Processing' ? (
                              <Badge tone="warning">处理中</Badge>
                            ) : (
                              <Badge tone="success">已处理</Badge>
                            )}
                          </Td>
                        </Tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </div>

            <div className="rounded-2xl border border-border">
              <div className="border-b border-border p-4">
                <div className="text-sm font-semibold">设备日志（占位）</div>
                <div className="text-xs text-muted">上线/下线、配置下发、主动唤醒等</div>
              </div>
              <div className="p-4 space-y-2">
                {logTimes.map((t) => (
                  <div key={t} className="flex items-center justify-between rounded-xl border border-border bg-bg/20 px-3 py-2 text-xs">
                    <div className="text-muted">{t}</div>
                    <div className="font-medium">状态上报</div>
                    <div className="text-muted">{device?.onlineStatus ?? '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {loading && <div className="text-xs text-muted">加载中...</div>}
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
            <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>安装位置</Label>
            <Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>备注</Label>
            <Textarea value={formNote} onChange={(e) => setFormNote(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
