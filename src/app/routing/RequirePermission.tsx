import { Navigate } from 'react-router-dom'
import type { Permission, Role } from '../../types/auth'
import { useAuth } from '../auth/useAuth'

export function RequirePermission({
  permission,
  roles,
  children,
}: {
  permission: Permission
  roles?: Role[]
  children: React.ReactNode
}) {
  const { hasPermission, user } = useAuth()
  if (roles && (!user || !roles.includes(user.role))) return <Navigate to="/403" replace />
  if (!hasPermission(permission)) return <Navigate to="/403" replace />
  return <>{children}</>
}
