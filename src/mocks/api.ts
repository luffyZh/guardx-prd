import type { AppUser, Role } from '../types/auth'
import type {
  Alarm,
  AlarmStatus,
  Batch,
  BatchDeviceItem,
  BatchStatus,
  Device,
  DeviceModel,
  DeviceOnlineStatus,
  Org,
  OrgStatus,
} from '../types/models'
import { createId } from '../lib/id'
import { sleep } from '../lib/sleep'

const nowIso = () => new Date().toISOString()

const orgs: Org[] = [
  {
    id: 'org_xja',
    name: '新疆合作单位 01：XJA',
    region: '新疆',
    contactName: '张工',
    contactPhone: '13000001001',
    address: '乌鲁木齐市示例路 1 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_xza',
    name: '西藏合作单位 01：XZA',
    region: '西藏',
    contactName: '李工',
    contactPhone: '13000001002',
    address: '拉萨市示例路 2 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_xjb',
    name: '新疆合作单位 02：XJB',
    region: '新疆',
    contactName: '王工',
    contactPhone: '13000001003',
    address: '喀什市示例路 3 号',
    status: 'Disabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_yn1',
    name: '云南合作单位 01：YN01',
    region: '云南',
    contactName: '陈工',
    contactPhone: '13000001004',
    address: '昆明市示例路 4 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_yn2',
    name: '云南合作单位 02：YN02',
    region: '云南',
    contactName: '赵工',
    contactPhone: '13000001005',
    address: '德宏州示例路 5 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_bj1',
    name: '北京合作单位 01：BJ01',
    region: '北京',
    contactName: '刘工',
    contactPhone: '13000001006',
    address: '北京市示例路 6 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_zj1',
    name: '浙江合作单位 01：ZJ01',
    region: '浙江',
    contactName: '周工',
    contactPhone: '13000001007',
    address: '杭州市示例路 7 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_gd1',
    name: '广东合作单位 01：GD01',
    region: '广东',
    contactName: '吴工',
    contactPhone: '13000001008',
    address: '广州市示例路 8 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_sc1',
    name: '四川合作单位 01：SC01',
    region: '四川',
    contactName: '郑工',
    contactPhone: '13000001009',
    address: '成都市示例路 9 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_hb1',
    name: '湖北合作单位 01：HB01',
    region: '湖北',
    contactName: '冯工',
    contactPhone: '13000001010',
    address: '武汉市示例路 10 号',
    status: 'Disabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_hn1',
    name: '湖南合作单位 01：HN01',
    region: '湖南',
    contactName: '韩工',
    contactPhone: '13000001011',
    address: '长沙市示例路 11 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_fj1',
    name: '福建合作单位 01：FJ01',
    region: '福建',
    contactName: '沈工',
    contactPhone: '13000001012',
    address: '福州市示例路 12 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_js1',
    name: '江苏合作单位 01：JS01',
    region: '江苏',
    contactName: '许工',
    contactPhone: '13000001013',
    address: '南京市示例路 13 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_sd1',
    name: '山东合作单位 01：SD01',
    region: '山东',
    contactName: '何工',
    contactPhone: '13000001014',
    address: '济南市示例路 14 号',
    status: 'Disabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_sx1',
    name: '陕西合作单位 01：SX01',
    region: '陕西',
    contactName: '吕工',
    contactPhone: '13000001015',
    address: '西安市示例路 15 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_gx1',
    name: '广西合作单位 01：GX01',
    region: '广西',
    contactName: '施工',
    contactPhone: '13000001016',
    address: '南宁市示例路 16 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_gz1',
    name: '贵州合作单位 01：GZ01',
    region: '贵州',
    contactName: '孔工',
    contactPhone: '13000001017',
    address: '贵阳市示例路 17 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
  {
    id: 'org_ln1',
    name: '辽宁合作单位 01：LN01',
    region: '辽宁',
    contactName: '曹工',
    contactPhone: '13000001018',
    address: '沈阳市示例路 18 号',
    status: 'Enabled',
    createdAt: nowIso(),
  },
]

const users: AppUser[] = [
  {
    id: 'u_sys_1',
    name: 'NH_Admin',
    phone: '13011112222',
    role: 'SystemAdmin',
    permissions: [],
    status: 'Enabled',
  },
  {
    id: 'u_org_admin_1',
    name: 'XJA_Admin',
    phone: '13000000001',
    orgId: 'org_xja',
    role: 'OrgAdmin',
    permissions: [],
    status: 'Enabled',
  },
  {
    id: 'u_org_user_1',
    name: 'XJA_User',
    phone: '13000000002',
    orgId: 'org_xja',
    role: 'OrgUser',
    permissions: [],
    status: 'Enabled',
  },
  {
    id: 'u_org_user_2',
    name: 'XZA_User',
    phone: '13000000003',
    orgId: 'org_xza',
    role: 'OrgUser',
    permissions: [],
    status: 'Disabled',
  },
]

const devices: Device[] = [
  {
    id: 'GuardXV1202605_0001',
    name: '南门主通道哨兵',
    orgId: 'org_xja',
    model: 'HVS-3.0',
    onlineStatus: 'Online',
    batteryPercent: 78,
    networkType: '4G',
    lastHeartbeatAt: nowIso(),
    ip: '10.23.1.12',
    firmwareVersion: '3.0.12',
    location: '南门主通道',
    batchId: 'GuardXV1202605',
    bindAt: nowIso(),
  },
  {
    id: 'GuardXV1202605_0002',
    name: '东门围栏哨兵',
    orgId: 'org_xja',
    model: 'AOV-2.0',
    onlineStatus: 'Offline',
    lastHeartbeatAt: nowIso(),
    ip: '10.23.1.13',
    firmwareVersion: '2.0.8',
    location: '东门围栏',
    batchId: 'GuardXV1202605',
    bindAt: nowIso(),
  },
  {
    id: 'GuardXV1202605_0003',
    name: '西门车道哨兵',
    orgId: 'org_xza',
    model: 'HVS-3.0',
    onlineStatus: 'Unactivated',
    location: '西门车道',
    batchId: 'GuardXV1202605',
  },
  {
    id: 'GuardXV1202605_0004',
    name: '备用哨兵',
    model: 'AOV-2.0',
    onlineStatus: 'Unactivated',
    batchId: 'GuardXV1202605',
  },
]

const batches: Batch[] = [
  {
    id: 'GuardXV1202605',
    name: 'GuardXV1202605',
    model: 'HVS-3.0',
    total: 50,
    createdAt: nowIso(),
    status: 'Running',
    note: '样例批次',
  },
]

const batchDeviceItems: Record<string, BatchDeviceItem[]> = {
  GuardXV1202605: Array.from({ length: 8 }).map((_, i) => {
    const deviceId = `GuardXV1202605_${String(i + 1).padStart(4, '0')}`
    const linked = devices.find((d) => d.id === deviceId)
    return {
      deviceId,
      orgId: linked?.orgId,
      bindAt: linked?.bindAt,
      onlineStatus: linked?.onlineStatus,
    }
  }),
}

const alarms: Alarm[] = [
  {
    id: 'ALM_0001',
    occurredAt: nowIso(),
    type: '人员闯入',
    level: 'Critical',
    deviceId: 'GuardXV1202605_0001',
    deviceName: '南门主通道哨兵',
    orgId: 'org_xja',
    location: '南门主通道',
    status: 'Pending',
  },
  {
    id: 'ALM_0002',
    occurredAt: nowIso(),
    type: '异常徘徊',
    level: 'Warning',
    deviceId: 'GuardXV1202605_0002',
    deviceName: '东门围栏哨兵',
    orgId: 'org_xja',
    location: '东门围栏',
    status: 'Processing',
    handler: 'XJA_Admin',
  },
  {
    id: 'ALM_0003',
    occurredAt: nowIso(),
    type: '未戴安全帽',
    level: 'Info',
    deviceId: 'GuardXV1202605_0001',
    deviceName: '南门主通道哨兵',
    orgId: 'org_xja',
    location: '南门主通道',
    status: 'Resolved',
    handler: 'XJA_User',
  },
]

function maybeFail() {
  const r = Math.random()
  if (r < 0.08) throw new Error('网络波动，请重试')
}

export interface PageResult<T> {
  items: T[]
  total: number
}

function paginate<T>(items: T[], page: number, pageSize: number): PageResult<T> {
  const total = items.length
  const start = (page - 1) * pageSize
  return { items: items.slice(start, start + pageSize), total }
}

export async function listOrgs(params: {
  q?: string
  status?: OrgStatus | 'All'
  page: number
  pageSize: number
}) {
  await sleep(260)
  maybeFail()
  const q = params.q?.trim().toLowerCase()
  const filtered = orgs.filter((o) => {
    const matchQ = !q || o.name.toLowerCase().includes(q) || o.contactName.toLowerCase().includes(q)
    const matchStatus = !params.status || params.status === 'All' || o.status === params.status
    return matchQ && matchStatus
  })
  return paginate(filtered, params.page, params.pageSize)
}

export async function getOrg(orgId: string) {
  await sleep(240)
  maybeFail()
  const found = orgs.find((o) => o.id === orgId)
  if (!found) throw new Error('组织不存在')
  return found
}

export async function upsertOrg(input: Omit<Org, 'createdAt'> & { createdAt?: string }) {
  await sleep(420)
  maybeFail()
  const nameExists = orgs.some((o) => o.name === input.name && o.id !== input.id)
  if (nameExists) throw new Error('组织名称已存在')
  const idx = orgs.findIndex((o) => o.id === input.id)
  const record: Org = {
    ...input,
    createdAt: input.createdAt ?? nowIso(),
  }
  if (idx >= 0) orgs[idx] = record
  else orgs.unshift(record)
  return record
}

export async function toggleOrgStatus(orgId: string) {
  await sleep(380)
  maybeFail()
  const idx = orgs.findIndex((o) => o.id === orgId)
  if (idx < 0) throw new Error('组织不存在')
  const next = orgs[idx].status === 'Enabled' ? 'Disabled' : 'Enabled'
  orgs[idx] = { ...orgs[idx], status: next }

  users.forEach((u, i) => {
    if (u.orgId !== orgId) return
    users[i] = { ...u, status: next === 'Disabled' ? 'Disabled' : u.status }
  })

  devices.forEach((d, i) => {
    if (d.orgId !== orgId) return
    devices[i] = {
      ...d,
      onlineStatus: next === 'Disabled' ? 'Offline' : d.onlineStatus,
    }
  })

  return orgs[idx]
}

export async function listUsers(params: {
  q?: string
  orgId?: string | 'All'
  role?: Role | 'All'
  status?: 'Enabled' | 'Disabled' | 'All'
  page: number
  pageSize: number
}) {
  await sleep(260)
  maybeFail()
  const q = params.q?.trim().toLowerCase()
  const filtered = users.filter((u) => {
    const matchQ = !q || u.name.toLowerCase().includes(q) || (u.phone ?? '').includes(q)
    const matchOrg = !params.orgId || params.orgId === 'All' || u.orgId === params.orgId
    const matchRole = !params.role || params.role === 'All' || u.role === params.role
    const matchStatus = !params.status || params.status === 'All' || u.status === params.status
    return matchQ && matchOrg && matchRole && matchStatus
  })
  return paginate(filtered, params.page, params.pageSize)
}

export async function upsertUser(input: AppUser) {
  await sleep(420)
  maybeFail()
  const idx = users.findIndex((u) => u.id === input.id)
  if (idx >= 0) users[idx] = { ...input }
  else users.unshift({ ...input })
  return input
}

export async function toggleUserStatus(userId: string) {
  await sleep(320)
  maybeFail()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx < 0) throw new Error('用户不存在')
  const next = users[idx].status === 'Enabled' ? 'Disabled' : 'Enabled'
  users[idx] = { ...users[idx], status: next }
  return users[idx]
}

export async function resetUserPassword(userId: string) {
  await sleep(360)
  maybeFail()
  const found = users.find((u) => u.id === userId)
  if (!found) throw new Error('用户不存在')
  return { userId, password: 'guardx_pass1234!' }
}

export async function listDevices(params: {
  q?: string
  onlineStatus?: DeviceOnlineStatus | 'All'
  orgId?: string | 'All'
  page: number
  pageSize: number
}) {
  await sleep(260)
  maybeFail()
  const q = params.q?.trim().toLowerCase()
  const filtered = devices.filter((d) => {
    const matchQ = !q || d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)
    const matchStatus = !params.onlineStatus || params.onlineStatus === 'All' || d.onlineStatus === params.onlineStatus
    const matchOrg = !params.orgId || params.orgId === 'All' || d.orgId === params.orgId
    return matchQ && matchStatus && matchOrg
  })
  return paginate(filtered, params.page, params.pageSize)
}

export async function getDevice(deviceId: string) {
  await sleep(240)
  maybeFail()
  const found = devices.find((d) => d.id === deviceId)
  if (!found) throw new Error('设备不存在')
  return found
}

export async function bindDevice(input: {
  deviceId: string
  name: string
  orgId: string
  location?: string
  note?: string
}) {
  await sleep(520)
  maybeFail()
  const idx = devices.findIndex((d) => d.id === input.deviceId)
  if (idx < 0) throw new Error('设备 ID 无效或已被占用')
  const current = devices[idx]
  if (current.orgId) throw new Error('设备 ID 无效或已被占用')

  const next: Device = {
    ...current,
    name: input.name,
    orgId: input.orgId,
    location: input.location,
    note: input.note,
    bindAt: nowIso(),
    onlineStatus: 'Offline',
  }
  devices[idx] = next

  const items = batchDeviceItems[current.batchId ?? ''] ?? []
  const itemIdx = items.findIndex((it) => it.deviceId === current.id)
  if (itemIdx >= 0) {
    items[itemIdx] = { ...items[itemIdx], orgId: input.orgId, bindAt: next.bindAt, onlineStatus: next.onlineStatus }
  }

  return next
}

export async function updateDevice(input: Pick<Device, 'id' | 'name' | 'location' | 'note'>) {
  await sleep(420)
  maybeFail()
  const idx = devices.findIndex((d) => d.id === input.id)
  if (idx < 0) throw new Error('设备不存在')
  devices[idx] = { ...devices[idx], name: input.name, location: input.location, note: input.note }
  return devices[idx]
}

export async function unbindDevice(deviceId: string) {
  await sleep(420)
  maybeFail()
  const idx = devices.findIndex((d) => d.id === deviceId)
  if (idx < 0) throw new Error('设备不存在')
  const current = devices[idx]
  devices[idx] = {
    ...current,
    orgId: undefined,
    bindAt: undefined,
    onlineStatus: 'Unactivated',
  }
  return devices[idx]
}

export async function listBatches(params: { q?: string; status?: BatchStatus | 'All'; page: number; pageSize: number }) {
  await sleep(260)
  maybeFail()
  const q = params.q?.trim().toLowerCase()
  const filtered = batches.filter((b) => {
    const matchQ = !q || b.id.toLowerCase().includes(q) || b.name.toLowerCase().includes(q)
    const matchStatus = !params.status || params.status === 'All' || b.status === params.status
    return matchQ && matchStatus
  })
  return paginate(filtered, params.page, params.pageSize)
}

export async function createBatch(input: { id: string; total: number; model?: DeviceModel; note?: string }) {
  await sleep(520)
  maybeFail()
  const exists = batches.some((b) => b.id === input.id)
  if (exists) throw new Error('批次编号已存在')
  const batch: Batch = {
    id: input.id,
    name: input.id,
    total: input.total,
    model: input.model,
    createdAt: nowIso(),
    status: 'NotStarted',
    note: input.note,
  }
  batches.unshift(batch)

  const items: BatchDeviceItem[] = Array.from({ length: input.total }).map((_, i) => ({
    deviceId: `${input.id}_${String(i + 1).padStart(4, '0')}`,
  }))
  batchDeviceItems[input.id] = items

  items.slice(0, Math.min(6, items.length)).forEach((it) => {
    devices.push({
      id: it.deviceId,
      name: `设备 ${it.deviceId.slice(-4)}`,
      model: input.model ?? 'AOV-2.0',
      onlineStatus: 'Unactivated',
      batchId: input.id,
    })
  })

  return batch
}

export async function getBatch(batchId: string) {
  await sleep(240)
  maybeFail()
  const found = batches.find((b) => b.id === batchId)
  if (!found) throw new Error('批次不存在')
  return found
}

export async function listBatchDevices(batchId: string, params: { q?: string; bind?: 'All' | 'Bound' | 'Unbound'; page: number; pageSize: number }) {
  await sleep(260)
  maybeFail()
  const q = params.q?.trim().toLowerCase()
  const all = batchDeviceItems[batchId] ?? []
  const filtered = all.filter((it) => {
    const matchQ = !q || it.deviceId.toLowerCase().includes(q)
    const matchBind =
      !params.bind ||
      params.bind === 'All' ||
      (params.bind === 'Bound' ? Boolean(it.orgId) : !it.orgId)
    return matchQ && matchBind
  })
  return paginate(filtered, params.page, params.pageSize)
}

export async function listAlarms(params: {
  q?: string
  level?: 'All' | Alarm['level']
  status?: 'All' | AlarmStatus
  timePreset?: 'Today' | '7d' | '30d' | 'Custom'
  orgId?: string | 'All'
  page: number
  pageSize: number
}) {
  await sleep(260)
  maybeFail()
  const q = params.q?.trim().toLowerCase()

  const filtered = alarms.filter((a) => {
    const matchQ = !q || a.deviceName.toLowerCase().includes(q) || a.deviceId.toLowerCase().includes(q)
    const matchLevel = !params.level || params.level === 'All' || a.level === params.level
    const matchStatus = !params.status || params.status === 'All' || a.status === params.status
    const matchOrg = !params.orgId || params.orgId === 'All' || a.orgId === params.orgId
    return matchQ && matchLevel && matchStatus && matchOrg
  })

  return paginate(filtered, params.page, params.pageSize)
}

export async function deleteAlarm(alarmId: string) {
  await sleep(360)
  maybeFail()
  const idx = alarms.findIndex((a) => a.id === alarmId)
  if (idx < 0) throw new Error('告警不存在')
  alarms.splice(idx, 1)
  return { ok: true }
}

export async function createOrgScopedDeviceId(batchId: string) {
  await sleep(180)
  maybeFail()
  const id = createId(batchId).replaceAll('0x', '')
  return { id }
}

export async function listAllOrgs() {
  await sleep(120)
  return [...orgs]
}

export async function listAllUsersByOrg(orgId: string) {
  await sleep(120)
  return users.filter((u) => u.orgId === orgId)
}

export async function listAllDevicesByOrg(orgId: string) {
  await sleep(120)
  return devices.filter((d) => d.orgId === orgId)
}

export async function alarmStatsByOrg(orgId: string) {
  await sleep(120)
  const list = alarms.filter((a) => a.orgId === orgId)
  const total = list.length
  const pending = list.filter((a) => a.status === 'Pending').length
  const processing = list.filter((a) => a.status === 'Processing').length
  const resolved = list.filter((a) => a.status === 'Resolved').length
  return { total, pending, processing, resolved }
}
