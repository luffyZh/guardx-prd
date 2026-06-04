import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/auth/useAuth'
import { useToast } from '../../app/toast/useToast'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { ErrorText, Hint, Input, Label, Select, Textarea } from '../../components/Field'
import type { Org } from '../../types/models'
import { bindDevice, listAllOrgs } from '../../mocks/api'

export function DeviceNewPage() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [deviceId, setDeviceId] = useState('')
  const [name, setName] = useState('')
  const [orgId, setOrgId] = useState(() =>
    user?.role === 'OrgAdmin' ? (user.orgId ?? '') : '',
  )
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')

  const lockedOrgId = user?.role === 'OrgAdmin' ? (user.orgId ?? '') : ''
  const effectiveOrgId = lockedOrgId || orgId

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

  const submit = async () => {
    setError(null)
    if (!deviceId.trim()) return setError('请填写设备 ID')
    if (!name.trim()) return setError('请填写设备名称')
    if (!effectiveOrgId.trim()) return setError('请选择归属组织')
    try {
      setLoading(true)
      await bindDevice({
        deviceId: deviceId.trim(),
        name: name.trim(),
        orgId: effectiveOrgId,
        location: location.trim(),
        note: note.trim(),
      })
      toast.push('success', '绑定成功，设备状态已变更为离线')
      navigate('/admin/devices', { replace: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '绑定失败'
      setError(msg)
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
            <div className="text-base font-semibold">新增设备（绑定页）</div>
            <div className="text-xs text-muted">本质为激活并绑定设备到组织与业务场景</div>
          </div>
          <Link to="/admin/devices">
            <Button size="sm">返回列表</Button>
          </Link>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>设备 ID（必填）</Label>
              <Input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} placeholder="GuardXV1202605_0001" />
              <Hint>需处于“未绑定”状态；无效或已占用会被拦截</Hint>
            </div>
            <div className="space-y-2">
              <Label>设备名称（必填）</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="南门主通道哨兵" />
            </div>
            <div className="space-y-2">
              <Label>归属组织（必填）</Label>
              <Select
                value={effectiveOrgId}
                disabled={Boolean(lockedOrgId)}
                onChange={(e) => setOrgId(e.target.value)}
              >
                <option value="">请选择</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
              <Hint>{lockedOrgId ? '组织管理员默认锁定为本组织' : '系统管理员可手动选择组织'}</Hint>
            </div>
            <div className="space-y-2">
              <Label>安装位置（选填）</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="南门主通道" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>设备备注（选填）</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="记录安装人员、特殊配置要求等" />
            </div>
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          <div className="flex justify-end gap-2">
            <Button onClick={() => navigate(-1)} disabled={loading}>
              取消
            </Button>
            <Button variant="primary" onClick={submit} disabled={loading}>
              {loading ? '提交中...' : '确认绑定'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
