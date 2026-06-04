import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../../app/toast/useToast'
import { Button } from '../../components/Button'
import { Card, CardBody, CardHeader } from '../../components/Card'
import { ErrorText, Hint, Input, Label, Select, Textarea } from '../../components/Field'
import type { DeviceModel } from '../../types/models'
import { createBatch } from '../../mocks/api'

function validBatchId(value: string) {
  return /^[A-Za-z0-9_]+$/.test(value)
}

export function BatchNewPage() {
  const toast = useToast()
  const navigate = useNavigate()

  const [id, setId] = useState('')
  const [total, setTotal] = useState(50)
  const [model, setModel] = useState<DeviceModel>('HVS-3.0')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    const batchId = id.trim()
    if (!batchId) return setError('请填写批次编号')
    if (!validBatchId(batchId)) return setError('批次编号仅支持英文、数字及下划线')
    if (!Number.isFinite(total) || total <= 0) return setError('设备数量需为正整数')
    if (total > 1000) return setError('单次生成最大上限为 1000（原型限制）')
    try {
      setLoading(true)
      await createBatch({ id: batchId, total, model, note: note.trim() })
      toast.push('success', `成功生成 ${total} 个设备 ID`)
      navigate('/admin/batches', { replace: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '创建失败'
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
            <div className="text-base font-semibold">新增批次</div>
            <div className="text-xs text-muted">系统将基于表单生成设备 ID 池</div>
          </div>
          <Link to="/admin/batches">
            <Button size="sm">返回列表</Button>
          </Link>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>批次编号（必填）</Label>
              <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="GuardXV1202605" />
              <Hint>ID 生成规则：批次编号 + 下划线 + 4 位流水号</Hint>
            </div>
            <div className="space-y-2">
              <Label>设备数量（必填）</Label>
              <Input
                type="number"
                value={String(total)}
                onChange={(e) => setTotal(Number(e.target.value))}
                min={1}
                max={1000}
              />
              <Hint>建议设置单次生成上限防止卡顿</Hint>
            </div>
            <div className="space-y-2">
              <Label>设备型号</Label>
              <Select value={model} onChange={(e) => setModel(e.target.value as DeviceModel)}>
                <option value="AOV-2.0">AOV-2.0</option>
                <option value="HVS-3.0">HVS-3.0</option>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>备注说明（选填）</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="记录采购合同号、供应商信息或其他备注" />
            </div>
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          <div className="flex justify-end gap-2">
            <Button onClick={() => navigate(-1)} disabled={loading}>
              取消
            </Button>
            <Button variant="primary" onClick={submit} disabled={loading}>
              {loading ? '生成中...' : '确认生成'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
