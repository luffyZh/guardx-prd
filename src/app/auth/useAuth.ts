import { createContext, useContext } from 'react'
import type { AppUser, AuthSession, Permission, Role } from '../../types/auth'

export interface AuthContextValue {
  session: AuthSession | null
  user: AppUser | null
  isAuthenticated: boolean
  login: (account: string, password: string) => Promise<void>
  quickLogin: (role: Role) => Promise<void>
  logout: () => void
  hasPermission: (permission: Permission) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
}

