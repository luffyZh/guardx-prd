import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../app/toast/useToast'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { ErrorText, Hint, Input, Label, Select } from '../../components/Field'
import { Pagination } from '../../components/Pagination'
import { Table, Td, Th, Tr } from '../../components/Table'
import type { Batch, BatchStatus } from '../../types/models'
import { listBatches } from '../../mocks/api'

const pageSize = 10

function statusLabel(status: BatchStatus) {
  if (status === 'NotStarted') return <Badge tone="muted">未开始</Badge>
  if (status === 'Running') return <Badge tone="success">进行中</Badge>
  return <Badge tone="warning">已结束</Badge>
}

export function BatchesListPage() {
  const toast = useToast()

  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'All' | BatchStatus>('All')
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Batch[]>([])
  const [total, setTotal] = useState(0)

  const effectiveQ = useMemo(() => q.trim(), [q])

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await listBatches({ q: effectiveQ, status, page, pageSize })
        if (!alive) return
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
  }, [effectiveQ, status, page, toast])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <div className="text-base font-semibold">批次列表</div>
            <div className="text-xs text-muted">批次用于管理设备生产、入库、交付和组织分配</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm">导出</Button>
            <Link to="/admin/batches/new">
              <Button variant="primary">新增批次</Button>
            </Link>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label>搜索</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="批次编号 / 前缀" />
              <Hint>支持模糊查询</Hint>
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={status} onChange={(e) => setStatus(e.target.value as BatchStatus | 'All')}>
                <option value="All">全部</option>
                <option value="NotStarted">未开始</option>
                <option value="Running">进行中</option>
                <option value="Finished">已结束</option>
              </Select>
            </div>
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          <div className="rounded-2xl border border-border">
            <Table>
              <thead>
                <tr>
                  <Th>批次编号</Th>
                  <Th>设备总数</Th>
                  <Th>创建时间</Th>
                  <Th>状态</Th>
                  <Th className="text-right">操作</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <Td colSpan={5} className="py-10 text-center text-muted">
                      加载中...
                    </Td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <Td colSpan={5} className="py-10 text-center text-muted">
                      暂无数据
                    </Td>
                  </tr>
                ) : (
                  items.map((b) => (
                    <Tr key={b.id}>
                      <Td className="font-medium">
                        <Link to={`/admin/batches/${b.id}`} className="hover:underline">
                          {b.id}
                        </Link>
                      </Td>
                      <Td>{b.total}</Td>
                      <Td className="text-xs text-muted">{b.createdAt.slice(0, 19).replace('T', ' ')}</Td>
                      <Td>{statusLabel(b.status)}</Td>
                      <Td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/admin/batches/${b.id}`}>
                            <Button size="sm">查看详情</Button>
                          </Link>
                          <Button size="sm" variant="danger" disabled>
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
    </div>
  )
}
