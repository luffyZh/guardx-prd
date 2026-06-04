import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AdminLayout } from './layouts/AdminLayout'
import { RequireAuth } from './routing/RequireAuth'
import { RequirePermission } from './routing/RequirePermission'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { WallboardPage } from '../pages/WallboardPage'
import { AlarmsListPage } from '../pages/admin/AlarmsListPage'
import { BatchDetailPage } from '../pages/admin/BatchDetailPage'
import { BatchesListPage } from '../pages/admin/BatchesListPage'
import { BatchNewPage } from '../pages/admin/BatchNewPage'
import { DeviceDetailPage } from '../pages/admin/DeviceDetailPage'
import { DeviceNewPage } from '../pages/admin/DeviceNewPage'
import { DevicesListPage } from '../pages/admin/DevicesListPage'
import { OrgDetailPage } from '../pages/admin/OrgDetailPage'
import { OrgsListPage } from '../pages/admin/OrgsListPage'
import { OverviewPage } from '../pages/admin/OverviewPage'
import { UsersListPage } from '../pages/admin/UsersListPage'
import type { Permission, Role } from '../types/auth'

function P({
  permission,
  roles,
  children,
}: {
  permission: Permission
  roles?: Role[]
  children: React.ReactNode
}) {
  return (
    <RequirePermission permission={permission} roles={roles}>
      {children}
    </RequirePermission>
  )
}

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/wallboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/wallboard', element: <WallboardPage /> },
  { path: '/403', element: <ForbiddenPage /> },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/overview" replace /> },
      {
        path: 'overview',
        element: (
          <P permission="device:read">
            <OverviewPage />
          </P>
        ),
      },
      {
        path: 'orgs',
        element: (
          <P permission="org:read">
            <OrgsListPage />
          </P>
        ),
      },
      {
        path: 'orgs/:orgId',
        element: (
          <P permission="org:read">
            <OrgDetailPage />
          </P>
        ),
      },
      {
        path: 'users',
        element: (
          <P permission="user:read" roles={['SystemAdmin']}>
            <UsersListPage />
          </P>
        ),
      },
      {
        path: 'devices',
        element: (
          <P permission="device:read">
            <DevicesListPage />
          </P>
        ),
      },
      {
        path: 'devices/new',
        element: (
          <P permission="device:write">
            <DeviceNewPage />
          </P>
        ),
      },
      {
        path: 'devices/:deviceId',
        element: (
          <P permission="device:read">
            <DeviceDetailPage />
          </P>
        ),
      },
      {
        path: 'batches',
        element: (
          <P permission="batch:read" roles={['SystemAdmin']}>
            <BatchesListPage />
          </P>
        ),
      },
      {
        path: 'batches/new',
        element: (
          <P permission="batch:write" roles={['SystemAdmin']}>
            <BatchNewPage />
          </P>
        ),
      },
      {
        path: 'batches/:batchId',
        element: (
          <P permission="batch:read" roles={['SystemAdmin']}>
            <BatchDetailPage />
          </P>
        ),
      },
      {
        path: 'alarms',
        element: (
          <P permission="alarm:read">
            <AlarmsListPage />
          </P>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
], {
  basename: import.meta.env.BASE_URL,
})

export function AppRouter() {
  return <RouterProvider router={router} />
}
