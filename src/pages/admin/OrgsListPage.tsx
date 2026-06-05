import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '../../components/Button'
import { Card, CardBody } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Drawer } from '../../components/Drawer'
import { Confirm } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { ErrorText, Hint, Input, Label, Select, Textarea } from '../../components/Field'
import { Table, Td, Th, Tr } from '../../components/Table'
import { useAuth } from '../../app/auth/useAuth'
import { useToast } from '../../app/toast/useToast'
import type { Org, OrgStatus } from '../../types/models'
import { createId } from '../../lib/id'
import { listOrgs, toggleOrgStatus, upsertOrg } from '../../mocks/api'

const pageSize = 10

function statusBadge(status: OrgStatus) {
  return status === 'Enabled' ? <Badge tone="success">启用</Badge> : <Badge tone="danger">停用</Badge>
}

export function OrgsListPage() {
  const { user } = useAuth()
  const toast = useToast()

  const canManage = user?.role === 'SystemAdmin'

  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'All' | OrgStatus>('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Org[]>([])
  const [total, setTotal] = useState(0)

  const [editOpen, setEditOpen] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [form, setForm] = useState<Org | null>(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<Org | null>(null)

  const effectiveQ = useMemo(() => q.trim(), [q])

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await listOrgs({
          q: effectiveQ,
          status,
          page,
          pageSize,
        })
        if (!alive) return
        const scoped = canManage ? result : {
          items: result.items.filter((o) => o.id === user?.orgId),
          total: user?.orgId ? 1 : 0,
        }
        setItems(scoped.items)
        setTotal(scoped.total)
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
  }, [effectiveQ, status, page, canManage, user?.orgId])

  const openCreate = () => {
    const id = createId('org')
    setForm({
      id,
      name: '',
      region: '',
      contactName: '',
      contactPhone: '',
      address: '',
      status: 'Enabled',
      createdAt: new Date().toISOString(),
    })
    setEditError(null)
    setEditOpen(true)
  }

  const openEdit = (org: Org) => {
    setForm({ ...org })
    setEditError(null)
    setEditOpen(true)
  }

  const submit = async () => {
    if (!form) return
    setEditError(null)
    if (!form.name.trim()) return setEditError('请填写组织名称')
    if (!form.region.trim()) return setEditError('请填写所属地区')
    if (!form.contactName.trim()) return setEditError('请填写联系人')
    if (!form.contactPhone.trim()) return setEditError('请填写联系电话')
    if (!form.address.trim()) return setEditError('请填写详细地址')

    try {
      setLoading(true)
      await upsertOrg(form)
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

  const askToggle = (org: Org) => {
    setConfirmTarget(org)
    setConfirmOpen(true)
  }

  const doToggle = async () => {
    if (!confirmTarget) return
    try {
      setLoading(true)
      const updated = await toggleOrgStatus(confirmTarget.id)
      toast.push('success', updated.status === 'Enabled' ? '已启用组织' : '已停用组织')
      setConfirmOpen(false)
      setConfirmTarget(null)
      setPage(1)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '操作失败'
      toast.push('error', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索：组织名称 / 联系人"
              className="w-full sm:w-[320px]"
            />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrgStatus | 'All')}
              className="w-full sm:w-[160px]"
            >
              <option value="All">全部状态</option>
              <option value="Enabled">启用</option>
              <option value="Disabled">停用</option>
            </Select>
          </div>
          {canManage && (
            <Button variant="primary" onClick={openCreate} className="self-start sm:self-auto">
              <Plus className="inline-block w-4 h-4" />
              新增组织
            </Button>
          )}
        </CardBody>
      </Card>

      {error && <ErrorText>{error}</ErrorText>}

      <Table className="rounded-2xl border border-border bg-surface shadow-card">
        <thead>
          <tr>
            <Th>组织名称</Th>
            <Th>地区</Th>
            <Th>联系人</Th>
            <Th>电话</Th>
            <Th>状态</Th>
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
            items.map((org) => (
              <Tr key={org.id}>
                <Td className="font-medium">
                  <Link to={`/admin/orgs/${org.id}`} className="hover:underline">
                    {org.name}
                  </Link>
                </Td>
                <Td>{org.region}</Td>
                <Td>{org.contactName}</Td>
                <Td>{org.contactPhone}</Td>
                <Td>{statusBadge(org.status)}</Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => openEdit(org)} disabled={!canManage}>
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant={org.status === 'Enabled' ? 'danger' : 'primary'}
                      onClick={() => askToggle(org)}
                      disabled={!canManage}
                    >
                      {org.status === 'Enabled' ? '停用' : '启用'}
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))
          )}
        </tbody>
      </Table>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

      <Drawer
        open={editOpen}
        title={form?.name ? '编辑组织' : '新增组织'}
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
            <Label>组织 ID</Label>
            <Input value={form?.id ?? ''} readOnly />
            <Hint>系统自动生成</Hint>
          </div>
          <div className="space-y-2">
            <Label>组织名称</Label>
            <Input value={form?.name ?? ''} onChange={(e) => setForm((p) => (p ? { ...p, name: e.target.value } : p))} />
          </div>
          <div className="space-y-2">
            <Label>所属地区</Label>
            <Input value={form?.region ?? ''} onChange={(e) => setForm((p) => (p ? { ...p, region: e.target.value } : p))} />
          </div>
          <div className="space-y-2">
            <Label>联系人</Label>
            <Input value={form?.contactName ?? ''} onChange={(e) => setForm((p) => (p ? { ...p, contactName: e.target.value } : p))} />
          </div>
          <div className="space-y-2">
            <Label>联系电话</Label>
            <Input value={form?.contactPhone ?? ''} onChange={(e) => setForm((p) => (p ? { ...p, contactPhone: e.target.value } : p))} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>详细地址</Label>
            <Textarea value={form?.address ?? ''} onChange={(e) => setForm((p) => (p ? { ...p, address: e.target.value } : p))} />
          </div>
          <div className="space-y-2">
            <Label>状态</Label>
            <Select value={form?.status ?? 'Enabled'} onChange={(e) => setForm((p) => (p ? { ...p, status: e.target.value as OrgStatus } : p))}>
              <option value="Enabled">启用</option>
              <option value="Disabled">停用</option>
            </Select>
          </div>
        </div>
        {editError && <div className="mt-3"><ErrorText>{editError}</ErrorText></div>}
      </Drawer>

      <Confirm
        open={confirmOpen}
        title={confirmTarget?.status === 'Enabled' ? '确认停用组织？' : '确认启用组织？'}
        description={
          confirmTarget?.status === 'Enabled'
            ? '停用后，该组织下的所有用户将被强制下线且无法再次登录，设备暂停业务交互。'
            : '启用后，该组织恢复登录与业务交互能力。'
        }
        confirmText={confirmTarget?.status === 'Enabled' ? '确认停用' : '确认启用'}
        danger={confirmTarget?.status === 'Enabled'}
        onConfirm={doToggle}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}
