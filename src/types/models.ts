export type OrgStatus = 'Enabled' | 'Disabled'

export interface Org {
  id: string
  name: string
  region: string
  contactName: string
  contactPhone: string
  address: string
  status: OrgStatus
  createdAt: string
}

export type DeviceModel = 'AOV-2.0' | 'HVS-3.0'
export type DeviceOnlineStatus = 'Online' | 'Offline' | 'Unactivated'

export interface Device {
  id: string
  name: string
  orgId?: string
  model: DeviceModel
  onlineStatus: DeviceOnlineStatus
  batteryPercent?: number
  networkType?: '4G' | 'WiFi' | 'Ethernet'
  lastHeartbeatAt?: string
  ip?: string
  firmwareVersion?: string
  location?: string
  coords?: { lat: number; lng: number }
  note?: string
  batchId?: string
  bindAt?: string
}

export type BatchStatus = 'NotStarted' | 'Running' | 'Finished'

export interface Batch {
  id: string
  name: string
  model?: DeviceModel
  total: number
  createdAt: string
  status: BatchStatus
  note?: string
}

export interface BatchDeviceItem {
  deviceId: string
  orgId?: string
  bindAt?: string
  onlineStatus?: DeviceOnlineStatus
}

export type AlarmLevel = 'Critical' | 'Warning' | 'Info'
export type AlarmStatus = 'Pending' | 'Processing' | 'Resolved'

export interface Alarm {
  id: string
  snapshotUrl?: string
  occurredAt: string
  type: string
  level: AlarmLevel
  deviceId: string
  deviceName: string
  orgId?: string
  location?: string
  status: AlarmStatus
  handler?: string
}
