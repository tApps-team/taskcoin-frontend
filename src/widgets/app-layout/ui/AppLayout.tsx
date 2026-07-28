import { motion, useReducedMotion } from 'framer-motion'
import { ClipboardList, Coins, CreditCard, History, Hourglass, LogOut, User } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { loggedOut, useMeQuery, useUpdateProfileMutation } from '@/entities/session'
import { baseApi } from '@/shared/api'
import { haptic } from '@/shared/lib/haptics'
import { pageTransition } from '@/shared/lib/motion'
import { detectPlatform } from '@/shared/lib/platform'
import { cn } from '@/shared/lib/utils'
import { Button, CoinAmount } from '@/shared/ui'

const tabs = [
  { to: '/app', key: 'tasks', Icon: ClipboardList, end: true },
  { to: '/app/active', key: 'active', Icon: Hourglass, end: false },
  { to: '/app/withdraw', key: 'withdraw', Icon: CreditCard, end: false },
  { to: '/app/history', key: 'history', Icon: History, end: false },
  { to: '/app/profile', key: 'profile', Icon: User, end: false },
]

function Logo() {
  return (
    <div className="inline-flex items-center gap-1.5 text-xl font-bold tracking-tight">
      <Coins className="size-6 text-brand-teal" />
      <span className="text-gradient">TaskCoin</span>
    </div>
  )
}

export function AppLayout() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const location = useLocation()
  const { data: me } = useMeQuery()
  const [updateProfile] = useUpdateProfileMutation()

  // Keep the stored OS in sync with the actual device: backfills users who
  // registered on desktop and updates it if they switch phones. Only writes
  // when we can detect a mobile OS and it differs from what's saved.
  useEffect(() => {
    if (!me) return
    const detected = detectPlatform()
    if (detected && detected !== me.platform) {
      updateProfile({ platform: detected })
    }
  }, [me, updateProfile])

  const balance = me ? Number(me.balance) : 0

  const onLogout = () => {
    dispatch(loggedOut())
    dispatch(baseApi.util.resetApiState())
    navigate('/login')
  }

  return (
    <div className="min-h-[var(--app-min-h)] md:h-screen md:overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar (desktop) — fixed full height, only main scrolls */}
      <aside className="hidden md:flex md:flex-col shrink-0 w-64 m-3 mr-0 rounded-3xl glass p-5 md:overflow-y-auto">
        <div className="mb-8 px-1">
          <Logo />
        </div>
        <nav className="space-y-1.5 flex-1">
          {tabs.map(({ to, key, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => haptic()}
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
        <Button variant="secondary" className="mt-4" onClick={onLogout}>
          <LogOut /> {t('auth.logout')}
        </Button>
      </aside>

      {/* Main — the only scrollable region on desktop */}
      <div className="flex-1 flex flex-col min-w-0 md:min-h-0 md:overflow-hidden">
        <header className="px-4 py-3 flex items-center justify-between shrink-0 md:m-3 md:mb-0 md:rounded-2xl md:glass">
          <div className="md:hidden">
            <Logo />
          </div>
          <div className="ml-auto text-right">
            <CoinAmount value={balance} className="text-xl font-bold text-brand-teal drop-shadow" />
          </div>
        </header>

        <div className="flex-1 md:min-h-0 md:overflow-y-auto">
          <main className="p-4 pb-28 md:pb-6 max-w-3xl w-full mx-auto">
            {reduce ? (
              <Outlet />
            ) : (
              <motion.div key={location.pathname} variants={pageTransition} initial="hidden" animate="show">
                <Outlet />
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Bottom tab bar (mobile) — edge-to-edge, padded for the home indicator */}
      <nav
        className="md:hidden fixed inset-x-0 bottom-0 z-20 flex justify-around pt-2 glass border-t border-white/5"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {tabs.map(({ to, key, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => haptic()}
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
