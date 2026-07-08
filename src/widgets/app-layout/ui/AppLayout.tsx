import { ClipboardList, CreditCard, History, Hourglass, LogOut, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useGetPublicSettingsQuery } from '@/entities/app-settings'
import { loggedOut, useMeQuery } from '@/entities/session'
import { coinsToMoney, formatCoins, formatMoney } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui'

const tabs = [
  { to: '/app', key: 'tasks', Icon: ClipboardList, end: true },
  { to: '/app/active', key: 'active', Icon: Hourglass, end: false },
  { to: '/app/withdraw', key: 'withdraw', Icon: CreditCard, end: false },
  { to: '/app/history', key: 'history', Icon: History, end: false },
  { to: '/app/profile', key: 'profile', Icon: User, end: false },
]

function Logo() {
  return (
    <div className="text-xl font-bold tracking-tight">
      🍋 <span className="text-gradient">TaskCoin</span>
    </div>
  )
}

export function AppLayout() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data: me } = useMeQuery()
  const { data: settings } = useGetPublicSettingsQuery()

  const balance = me ? Number(me.balance) : 0
  const money = settings ? coinsToMoney(balance, settings.coin_rate) : 0

  const logout = () => {
    dispatch(loggedOut())
    navigate('/login')
  }

  return (
    <div className="min-h-full flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col w-64 m-3 mr-0 rounded-3xl glass p-5">
        <div className="mb-8 px-1">
          <Logo />
        </div>
        <nav className="space-y-1.5 flex-1">
          {tabs.map(({ to, key, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-2xl font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-brand-violet/90 to-brand-violetDark/80 text-white shadow-glow'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                )
              }
            >
              <Icon className="size-5" />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>
        <Button variant="secondary" className="mt-4" onClick={logout}>
          <LogOut /> {t('auth.logout')}
        </Button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 m-3 md:mb-0 rounded-2xl glass px-4 py-3 flex items-center justify-between">
          <div className="md:hidden">
            <Logo />
          </div>
          <div className="ml-auto text-right">
            <div className="text-xl font-bold text-brand-teal drop-shadow">{formatCoins(balance)}</div>
            {settings && (
              <div className="text-xs text-muted-foreground">≈ {formatMoney(money, settings.currency)}</div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 pb-28 md:pb-6 max-w-3xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav className="md:hidden fixed bottom-3 inset-x-3 rounded-2xl glass flex justify-around py-2 z-20">
        {tabs.map(({ to, key, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] transition-colors',
                isActive ? 'text-brand-purple' : 'text-muted-foreground',
              )
            }
          >
            <Icon className="size-5" />
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
