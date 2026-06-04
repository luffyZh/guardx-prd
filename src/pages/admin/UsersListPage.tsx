import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Confirm, Modal } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { ErrorText, Hint, Input, Label, Select } from '../../components/Field'
import { Table, Td, Th, Tr } from '../../components/Table'
import { useToast } from '../../app/toast/useToast'
import type { AppUser, Role } from '../../types/auth'
import type { Org } from '../../types/models'
import { createId } from '../../lib/id'
import { listAllOrgs, listUsers, resetUserPassword, toggleUserStatus, upsertUser } from '../../mocks/api'

const pageSize = 10

function roleLabel(role: Role) {
  if (role === 'SystemAdmin') return '系统管理员'
  if (role === 'OrgAdmin') return '组织管理员'
  return '组织用户'
}

export function UsersListPage() {
  const toast = useToast()

  const [orgs, setOrgs] = useState<Org[]>([])
  const [q, setQ] = useState('')
  const [orgId, setOrgId] = useState<'All' | string>('All')
  const [role, setRole] = useState<'All' | Role>('All')
  const [status, setStatus] = useState<'All' | 'Enabled' | 'Disabled'>('All')
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<AppUser[]>([])
  const [total, setTotal] = useState(0)

  const [editOpen, setEditOpen] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [form, setForm] = useState<AppUser | null>(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<AppUser | null>(null)

  const [resetOpen, setResetOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<AppUser | null>(null)
  const [resetResult, setResetResult] = useState<string | null>(null)

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

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await listUsers({
          q: effectiveQ,
          orgId,
          role,
          status,
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
  }, [effectiveQ, orgId, role, status, page])

  const orgName = (id?: string) => orgs.find((o) => o.id === id)?.name ?? '-'

  const openCreate = () => {
    setForm({
      id: createId('user'),
      name: '',
      phone: '',
      orgId: undefined,
      role: 'OrgUser',
      permissions: [],
      status: 'Enabled',
    })
    setEditError(null)
    setEditOpen(true)
  }

  const openEdit = (u: AppUser) => {
    setForm({ ...u })
    setEditError(null)
    setEditOpen(true)
  }

  const submit = async () => {
    if (!form) return
    setEditError(null)
    if (!form.name.trim()) return setEditError('请填写用户名')
    if (!form.phone?.trim()) return setEditError('请填写手机号')
    if (form.role !== 'SystemAdmin' && !form.orgId) return setEditError('请选择所属组织')
    try {
      setLoading(true)
      await upsertUser(form)
      toast.push('success', '保存成功（默认密码已生成）')
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
      setPage(1)
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <div className="text-base font-semibold">用户管理</div>
            <div className="text-xs text-muted">System Admin 专属一级页面</div>
          </div>
          <Button variant="primary" onClick={openCreate}>
            新增用户
          </Button>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label>搜索</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="用户名 / 手机号" />
              <Hint>模糊搜索</Hint>
            </div>
            <div className="space-y-2">
              <Label>组织</Label>
              <Select value={orgId} onChange={(e) => setOrgId(e.target.value)}>
                <option value="All">全部</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <Select value={role} onChange={(e) => setRole(e.target.value as Role | 'All')}>
                <option value="All">全部</option>
                <option value="SystemAdmin">系统管理员</option>
                <option value="OrgAdmin">组织管理员</option>
                <option value="OrgUser">组织用户</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={status} onChange={(e) => setStatus(e.target.value as 'All' | 'Enabled' | 'Disabled')}>
                <option value="All">全部</option>
                <option value="Enabled">启用</option>
                <option value="Disabled">停用</option>
              </Select>
            </div>
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          <div className="rounded-2xl border border-border">
            <Table>
              <thead>
                <tr>
                  <Th>用户名</Th>
                  <Th>手机号</Th>
                  <Th>所属组织</Th>
                  <Th>角色</Th>
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
                  items.map((u) => (
                    <Tr key={u.id}>
                      <Td className="font-medium">{u.name}</Td>
                      <Td>{u.phone}</Td>
                      <Td className="text-xs text-muted">{u.orgId ? orgName(u.orgId) : '-'}</Td>
                      <Td>{roleLabel(u.role)}</Td>
                      <Td>{u.status === 'Enabled' ? <Badge tone="success">启用</Badge> : <Badge tone="danger">停用</Badge>}</Td>
                      <Td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => openEdit(u)}>
                            编辑
                          </Button>
                          <Button size="sm" onClick={() => openReset(u)}>
                            重置密码
                          </Button>
                          <Button
                            size="sm"
                            variant={u.status === 'Enabled' ? 'danger' : 'primary'}
                            onClick={() => askToggle(u)}
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

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </CardBody>
      </Card>

      <Modal
        open={editOpen}
        title={form?.name ? '编辑用户' : '新增用户'}
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
          <div className="space-y-2">
            <Label>用户名</Label>
            <Input value={form?.name ?? ''} onChange={(e) => setForm((p) => (p ? { ...p, name: e.target.value } : p))} />
          </div>
          <div className="space-y-2">
            <Label>手机号（登录账号）</Label>
            <Input value={form?.phone ?? ''} onChange={(e) => setForm((p) => (p ? { ...p, phone: e.target.value } : p))} />
          </div>
          <div className="space-y-2">
            <Label>所属组织</Label>
            <Select value={form?.orgId ?? ''} onChange={(e) => setForm((p) => (p ? { ...p, orgId: e.target.value || undefined } : p))}>
              <option value="">-</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
            <Hint>系统管理员可不绑定组织</Hint>
          </div>
          <div className="space-y-2">
            <Label>角色</Label>
            <Select value={form?.role ?? 'OrgUser'} onChange={(e) => setForm((p) => (p ? { ...p, role: e.target.value as Role } : p))}>
              <option value="SystemAdmin">系统管理员</option>
              <option value="OrgAdmin">组织管理员</option>
              <option value="OrgUser">组织用户</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>状态</Label>
            <Select
              value={form?.status ?? 'Enabled'}
              onChange={(e) =>
                setForm((p) =>
                  p ? { ...p, status: e.target.value as AppUser['status'] } : p,
                )
              }
            >
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
