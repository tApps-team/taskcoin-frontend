import {
  CheckSquare,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { loggedOut, useMeQuery } from '@/entities/session'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui'

const links = [
  { to: '/admin/dashboard', key: 'dashboard', Icon: LayoutDashboard },
  { to: '/admin/users', key: 'users', Icon: Users },
  { to: '/admin/tasks', key: 'tasks', Icon: ClipboardList },
  { to: '/admin/submissions', key: 'submissions', Icon: CheckSquare },
  { to: '/admin/withdrawals', key: 'withdrawals', Icon: CreditCard },
  { to: '/admin/settings', key: 'settings', Icon: Settings },
]

export function AdminLayout() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data: me } = useMeQuery()

  const logout = () => {
    dispatch(loggedOut())
    navigate('/admin/login')
  }

  return (
    <div className="h-screen overflow-hidden flex p-3 gap-3">
      <aside className="w-60 rounded-3xl glass flex flex-col p-5 shrink-0 overflow-y-auto">
        <div className="text-lg font-bold mb-8 text-gradient">{t('admin.title')}</div>
        <nav className="space-y-1.5 flex-1">
          {links.map(({ to, key, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-brand-violet/90 to-brand-violetDark/80 text-white shadow-glow'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {t(`admin.nav.${key}`)}
            </NavLink>
          ))}
        </nav>
        <div className="text-xs text-muted-foreground mb-2 truncate">{me?.email}</div>
        <Button variant="secondary" size="sm" onClick={logout}>
          <LogOut /> {t('auth.logout')}
        </Button>
      </aside>

      <main className="flex-1 min-w-0 min-h-0 rounded-3xl glass p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
