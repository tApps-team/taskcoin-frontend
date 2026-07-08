import { Navigate, Outlet } from 'react-router-dom'
import { useIsAuthenticated, useSession } from '@/entities/session'

// User area: requires any authenticated session.
export function RequireAuth() {
  const isAuth = useIsAuthenticated()
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />
}

// Admin area: requires an authenticated super_admin.
export function RequireAdmin() {
  const isAuth = useIsAuthenticated()
  const { user } = useSession()
  if (!isAuth) return <Navigate to="/admin/login" replace />
  if (!user || user.role !== 'super_admin') return <Navigate to="/admin/login" replace />
  return <Outlet />
}
