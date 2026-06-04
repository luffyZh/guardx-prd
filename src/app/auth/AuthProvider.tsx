import { useCallback, useMemo, useState } from 'react'
import type { AppUser, AuthSession, Permission, Role } from '../../types/auth'
import { sleep } from '../../lib/sleep'
import { AuthContext } from './useAuth'
import type { AuthContextValue } from './useAuth'

const storageKey = 'guardx.session'

function readSession(): AuthSession | null {
  const raw = localStorage.getItem(storageKey)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

function writeSession(session: AuthSession | null) {
  if (!session) localStorage.removeItem(storageKey)
  else localStorage.setItem(storageKey, JSON.stringify(session))
}

function permissionsForRole(role: Role): Permission[] {
  if (role === 'SystemAdmin') {
    return [
      'org:read',
      'org:write',
      'user:read',
      'user:write',
      'device:read',
      'device:write',
      'batch:read',
      'batch:write',
      'alarm:read',
      'alarm:write',
    ]
  }
  if (role === 'OrgAdmin') {
    return ['org:read', 'user:read', 'user:write', 'device:read', 'device:write', 'alarm:read']
  }
  return ['device:read', 'alarm:read']
}

function demoUser(role: Role): AppUser {
  if (role === 'SystemAdmin') {
    return {
      id: 'u_sys_1',
      name: 'NH_Admin',
      phone: '13011112222',
      role: 'SystemAdmin',
      permissions: permissionsForRole('SystemAdmin'),
      status: 'Enabled',
    }
  }
  if (role === 'OrgAdmin') {
    return {
      id: 'u_org_admin_1',
      name: 'XJA_Admin',
      phone: '13000000001',
      orgId: 'org_xja',
      role: 'OrgAdmin',
      permissions: permissionsForRole('OrgAdmin'),
      status: 'Enabled',
    }
  }
  return {
    id: 'u_org_user_1',
    name: 'XJA_User',
    phone: '13000000002',
    orgId: 'org_xja',
    role: 'OrgUser',
    permissions: permissionsForRole('OrgUser'),
    status: 'Enabled',
  }
}

async function loginMock(account: string, password: string): Promise<AuthSession> {
  await sleep(450)

  const normalized = account.trim()
  const passOk = password === 'hfklhjs_f233jjks@!'
  if (!passOk) throw new Error('账号或密码错误')

  let role: Role = 'SystemAdmin'
  if (normalized === 'org-admin' || normalized === '13000000001') role = 'OrgAdmin'
  if (normalized === 'org-user' || normalized === '13000000002') role = 'OrgUser'
  if (normalized === 'nh-admin' || normalized === '13011112222') role = 'SystemAdmin'

  const user = demoUser(role)
  return {
    accessToken: `access_${Date.now()}`,
    refreshToken: `refresh_${Date.now()}`,
    user,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readSession())

  const login = useCallback(async (account: string, password: string) => {
    const next = await loginMock(account, password)
    setSession(next)
    writeSession(next)
  }, [])

  const quickLogin = useCallback(async (role: Role) => {
    const next = await loginMock(
      role === 'SystemAdmin' ? 'nh-admin' : role === 'OrgAdmin' ? 'org-admin' : 'org-user',
      'hfklhjs_f233jjks@!',
    )
    setSession(next)
    writeSession(next)
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    writeSession(null)
  }, [])

  const hasPermission = useCallback(
    (permission: Permission) => {
      return session?.user.permissions.includes(permission) ?? false
    },
    [session],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      login,
      quickLogin,
      logout,
      hasPermission,
    }),
    [session, login, quickLogin, logout, hasPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
