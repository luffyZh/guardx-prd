export type Role = 'SystemAdmin' | 'OrgAdmin' | 'OrgUser'

export type Permission =
  | 'org:read'
  | 'org:write'
  | 'user:read'
  | 'user:write'
  | 'device:read'
  | 'device:write'
  | 'batch:read'
  | 'batch:write'
  | 'alarm:read'
  | 'alarm:write'

export type ThemeMode = 'system' | 'light' | 'dark'

export type AccountStatus = 'Enabled' | 'Disabled'

export interface AppUser {
  id: string
  name: string
  phone?: string
  orgId?: string
  role: Role
  permissions: Permission[]
  status: AccountStatus
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: AppUser
}

