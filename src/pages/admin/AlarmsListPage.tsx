import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../app/auth/useAuth'
import { useToast } from '../../app/toast/useToast'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { ErrorText, Hint, Input, Label, Select } from '../../components/Field'
import { Confirm, Modal } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { Table, Td, Th, Tr } from '../../components/Table'
import { Tabs } from '../../components/Tabs'
import type { Alarm, Org } from '../../types/models'
import { deleteAlarm, listAlarms, listAllOrgs } from '../../mocks/api'

const pageSize = 10

function levelBadge(level: Alarm['level']) {
  if (level === 'Critical') return <Badge tone="danger">严重</Badge>
  if (level === 'Warning') return <Badge tone="warning">警告</Badge>
  return <Badge tone="info">提示</Badge>
}

function statusBadge(status: Alarm['status']) {
  if (status === 'Pending') return <Badge tone="danger">待处理</Badge>
  if (status === 'Processing') return <Badge tone="warning">处理中</Badge>
  return <Badge tone="success">已处理</Badge>
}

export function AlarmsListPage() {
  const toast = useToast()
  const { user } = useAuth()
  const [sp, setSp] = useSearchParams()

  const [orgs, setOrgs] = useState<Org[]>([])
  const [q, setQ] = useState(sp.get('q') ?? '')
  const [timePreset, setTimePreset] = useState<'Today' | '7d' | '30d'>('Today')
  const [level, setLevel] = useState<'All' | Alarm['level']>('All')
  const [statusTab, setStatusTab] = useState<'All' | Alarm['status']>('All')
  const [orgId, setOrgId] = useState<'All' | string>('All')
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Alarm[]>([])
  const [total, setTotal] = useState(0)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState<Alarm | null>(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<Alarm | null>(null)

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
    setSp(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (effectiveQ) next.set('q', effectiveQ)
        else next.delete('q')
        return next
      },
      { replace: true },
    )
  }, [effectiveQ, setSp])

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await listAlarms({
          q: effectiveQ,
          level,
          status: statusTab,
          timePreset,
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
  }, [effectiveQ, level, statusTab, timePreset, effectiveOrg, page])

  const openDetail = (a: Alarm) => {
    setDetail(a)
    setDetailOpen(true)
  }

  const askDelete = (a: Alarm) => {
    setConfirmTarget(a)
    setConfirmOpen(true)
  }

  const doDelete = async () => {
    if (!confirmTarget) return
    try {
      setLoading(true)
      await deleteAlarm(confirmTarget.id)
      toast.push('success', '删除成功')
      setConfirmOpen(false)
      setPage(1)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '删除失败'
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
            <div className="text-base font-semibold">告警列表</div>
            <div className="text-xs text-muted">支持筛选、导出与详情查看</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm">导出</Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <Tabs
            value={statusTab}
            options={[
              { value: 'All', label: '全部' },
              { value: 'Pending', label: '待处理' },
              { value: 'Processing', label: '处理中' },
              { value: 'Resolved', label: '已处理' },
            ]}
            onChange={(v) => setStatusTab(v as Alarm['status'] | 'All')}
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label>设备搜索</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="设备名称 / 设备 ID" />
              <Hint>精确/模糊查询</Hint>
            </div>
            <div className="space-y-2">
              <Label>时间范围</Label>
              <Select
                value={timePreset}
                onChange={(e) => setTimePreset(e.target.value as 'Today' | '7d' | '30d')}
              >
                <option value="Today">今日</option>
                <option value="7d">近 7 天</option>
                <option value="30d">近 30 天</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>告警级别</Label>
              <Select value={level} onChange={(e) => setLevel(e.target.value as Alarm['level'] | 'All')}>
                <option value="All">全部</option>
                <option value="Critical">严重</option>
                <option value="Warning">警告</option>
                <option value="Info">提示</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>归属组织</Label>
              <Select value={effectiveOrg} disabled={user?.role !== 'SystemAdmin'} onChange={(e) => setOrgId(e.target.value)}>
                <option value="All">全部</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
              <Hint>系统管理员专属筛选条件</Hint>
            </div>
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          <div className="rounded-2xl border border-border">
            <Table>
              <thead>
                <tr>
                  <Th>告警编号</Th>
                  <Th>触发时间</Th>
                  <Th>告警类型</Th>
                  <Th>级别</Th>
                  <Th>触发设备</Th>
                  <Th>位置信息</Th>
                  <Th>处理状态</Th>
                  <Th>处理人</Th>
                  <Th className="text-right">操作</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <Td colSpan={9} className="py-10 text-center text-muted">
                      加载中...
                    </Td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <Td colSpan={9} className="py-10 text-center text-muted">
                      暂无数据
                    </Td>
                  </tr>
                ) : (
                  items.map((a) => (
                    <Tr key={a.id}>
                      <Td className="font-medium">{a.id}</Td>
                      <Td className="text-xs text-muted">{a.occurredAt.slice(0, 19).replace('T', ' ')}</Td>
                      <Td className="font-medium">{a.type}</Td>
                      <Td>{levelBadge(a.level)}</Td>
                      <Td className="text-xs text-muted">
                        {a.deviceName}
                        <div className="text-[11px] text-muted">{a.deviceId}</div>
                      </Td>
                      <Td className="text-xs text-muted">{a.location ?? '-'}</Td>
                      <Td>{statusBadge(a.status)}</Td>
                      <Td className="text-xs text-muted">{a.handler ?? '-'}</Td>
                      <Td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => openDetail(a)}>
                            查看
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => askDelete(a)}>
                            删除
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
        open={detailOpen}
        title="告警详情"
        onClose={() => setDetailOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDetailOpen(false)}>关闭</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-bg/20 p-4">
              <div className="text-xs text-muted">基础信息</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted">告警编号</div>
                <div className="font-semibold">{detail?.id ?? '-'}</div>
                <div className="text-muted">时间</div>
                <div className="font-semibold">{detail?.occurredAt ? detail.occurredAt.slice(0, 19).replace('T', ' ') : '-'}</div>
                <div className="text-muted">类型</div>
                <div className="font-semibold">{detail?.type ?? '-'}</div>
                <div className="text-muted">级别</div>
                <div className="font-semibold">{detail ? levelBadge(detail.level) : '-'}</div>
                <div className="text-muted">状态</div>
                <div className="font-semibold">{detail ? statusBadge(detail.status) : '-'}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-bg/20 p-4">
              <div className="text-xs text-muted">上下文（占位）</div>
              <div className="mt-2 text-sm">
                <div className="text-muted">触发设备</div>
                <div className="font-semibold">{detail?.deviceName ?? '-'}</div>
                <div className="mt-2 text-muted">位置信息</div>
                <div className="font-semibold">{detail?.location ?? '-'}</div>
              </div>
              <div className="mt-3 flex h-[140px] items-center justify-center rounded-xl border border-border bg-bg/30 text-xs text-muted">
                抓拍图片 / 短视频占位
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Confirm
        open={confirmOpen}
        title="确认删除告警？"
        description="删除操作不可恢复，需要二次确认。"
        confirmText="确认删除"
        danger
        onConfirm={doDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}
