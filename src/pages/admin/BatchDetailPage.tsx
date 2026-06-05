import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useToast } from '../../app/toast/useToast'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { ErrorText, Hint, Input, Label, Select } from '../../components/Field'
import { Pagination } from '../../components/Pagination'
import { Table, Td, Th, Tr } from '../../components/Table'
import type { Batch, BatchDeviceItem } from '../../types/models'
import { getBatch, listBatchDevices } from '../../mocks/api'

const pageSize = 10

export function BatchDetailPage() {
  const { batchId } = useParams()
  const id = batchId ?? ''
  const toast = useToast()

  const [batch, setBatch] = useState<Batch | null>(null)
  const [items, setItems] = useState<BatchDeviceItem[]>([])
  const [total, setTotal] = useState(0)

  const [q, setQ] = useState('')
  const [bind, setBind] = useState<'All' | 'Bound' | 'Unbound'>('All')
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectiveQ = useMemo(() => q.trim(), [q])

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const b = await getBatch(id)
        const res = await listBatchDevices(id, { q: effectiveQ, bind, page, pageSize })
        if (!alive) return
        setBatch(b)
        setItems(res.items)
        setTotal(res.total)
      } catch (e) {
        const msg = e instanceof Error ? e.message : '加载失败'
        if (!alive) return
        setError(msg)
        toast.push('error', msg)
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [id, effectiveQ, bind, page, toast])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <div className="text-base font-semibold">批次详情</div>
            <div className="text-xs text-muted">{batch?.id ?? id}</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm">导出 ID</Button>
            <Link to="/admin/batches">
              <Button size="sm">返回列表</Button>
            </Link>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          {error && <ErrorText>{error}</ErrorText>}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-border bg-bg/20 p-4">
              <div className="text-xs text-muted">设备型号</div>
              <div className="mt-1 text-sm font-semibold">{batch?.model ?? '-'}</div>
            </div>
            <div className="rounded-2xl border border-border bg-bg/20 p-4">
              <div className="text-xs text-muted">设备总数</div>
              <div className="mt-1 text-2xl font-semibold">{batch?.total ?? '-'}</div>
            </div>
            <div className="rounded-2xl border border-border bg-bg/20 p-4">
              <div className="text-xs text-muted">创建时间</div>
              <div className="mt-1 text-sm font-semibold">{batch?.createdAt ? batch.createdAt.slice(0, 19).replace('T', ' ') : '-'}</div>
            </div>
            <div className="rounded-2xl border border-border bg-bg/20 p-4">
              <div className="text-xs text-muted">状态</div>
              <div className="mt-1">
                {batch?.status === 'Running' ? (
                  <Badge tone="success">进行中</Badge>
                ) : batch?.status === 'Finished' ? (
                  <Badge tone="warning">已结束</Badge>
                ) : (
                  <Badge tone="muted">未开始</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label>设备 ID 搜索</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="输入尾号或完整 ID" />
              <Hint>支持模糊查询</Hint>
            </div>
            <div className="space-y-2">
              <Label>绑定状态</Label>
              <Select value={bind} onChange={(e) => setBind(e.target.value as 'All' | 'Bound' | 'Unbound')}>
                <option value="All">全部</option>
                <option value="Bound">已绑定</option>
                <option value="Unbound">未绑定</option>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border border-border">
            <Table>
              <thead>
                <tr>
                  <Th>设备 ID</Th>
                  <Th>绑定状态</Th>
                  <Th>归属组织</Th>
                  <Th>在线状态</Th>
                  <Th>绑定时间</Th>
                  <Th className="text-right">操作</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <Td colSpan={6} className="py-10 text-center text-muted">
                      加载中...
                    </Td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <Td colSpan={6} className="py-10 text-center text-muted">
                      暂无数据
                    </Td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <Tr key={it.deviceId}>
                      <Td className="font-medium">{it.deviceId}</Td>
                      <Td>{it.orgId ? <Badge tone="success">已绑定</Badge> : <Badge tone="muted">未绑定</Badge>}</Td>
                      <Td className="text-xs text-muted">{it.orgId ?? '-'}</Td>
                      <Td>
                        {it.orgId ? (
                          it.onlineStatus === 'Online' ? (
                            <Badge tone="success">在线</Badge>
                          ) : it.onlineStatus === 'Offline' ? (
                            <Badge tone="muted">离线</Badge>
                          ) : (
                            <Badge tone="warning">未激活</Badge>
                          )
                        ) : (
                          '-'
                        )}
                      </Td>
                      <Td className="text-xs text-muted">{it.bindAt ? it.bindAt.slice(0, 19).replace('T', ' ') : '-'}</Td>
                      <Td className="text-right">
                        {it.orgId ? (
                          <Link to={`/admin/devices/${it.deviceId}`}>
                            <Button size="sm">查看设备</Button>
                          </Link>
                        ) : (
                          <Button size="sm" disabled>
                            查看设备
                          </Button>
                        )}
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
    </div>
  )
}
