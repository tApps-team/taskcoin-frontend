import { Headset, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useGetPublicSettingsQuery } from '@/entities/app-settings'
import { loggedOut, useMeQuery, useUpdateProfileMutation } from '@/entities/session'
import { baseApi } from '@/shared/api'
import { useGetMyStatsQuery } from '@/entities/user'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CoinAmount,
  SimpleSelect,
  Spinner,
} from '@/shared/ui'

const COUNTRIES = [
  { value: 'RU', label: 'Россия' },
  { value: 'UZ', label: 'Узбекистан' },
  { value: 'KZ', label: 'Казахстан' },
  { value: 'BY', label: 'Беларусь' },
  { value: 'UA', label: 'Украина' },
  { value: 'KG', label: 'Киргизия' },
  { value: 'TJ', label: 'Таджикистан' },
  { value: 'AZ', label: 'Азербайджан' },
  { value: 'AM', label: 'Армения' },
  { value: 'GE', label: 'Грузия' },
  { value: 'MD', label: 'Молдова' },
]

export function ProfilePage() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data: me, isLoading } = useMeQuery()
  const { data: stats } = useGetMyStatsQuery()
  const { data: settings } = useGetPublicSettingsQuery()
  const [updateProfile] = useUpdateProfileMutation()

  if (isLoading || !me) return <Spinner />

  const onLogout = () => {
    dispatch(loggedOut())
    dispatch(baseApi.util.resetApiState())
    navigate('/login')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5 tracking-tight">{t('profile.title')}</h1>

      <Card className="mb-4">
        <CardContent className="p-5 flex items-center gap-4">
          <Avatar className="size-16 ring-2 ring-brand-violet/40">
            {me.avatar_url && <AvatarImage src={me.avatar_url} alt="" />}
            <AvatarFallback className="bg-gradient-to-br from-brand-violet to-brand-purple text-white text-2xl font-bold">
              {(me.full_name || me.email)[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-bold">{me.full_name || '—'}</div>
            <div className="text-muted-foreground text-sm">{me.email}</div>
            <div className="text-muted-foreground text-xs uppercase mt-0.5">
              {me.platform || t('profile.platformUnknown')}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label={t('profile.totalEarned')} value={<CoinAmount value={stats?.total_earned || 0} />} />
        <Stat label={t('profile.completedInstalls')} value={stats?.completed_installs ?? 0} />
        <Stat label={t('profile.balance')} value={<CoinAmount value={me.balance} />} />
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground mb-2">{t('profile.country')}</div>
          <SimpleSelect
            className="w-full"
            value={me.country || 'RU'}
            onValueChange={(v) => updateProfile({ country: v })}
            options={COUNTRIES}
          />
        </CardContent>
      </Card>

      {settings?.support_telegram_link && (
        <Card className="mb-6 relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-gradient-to-br from-brand-violet/30 to-brand-teal/20 blur-3xl" />
          <CardContent className="p-5 relative flex flex-col sm:flex-row items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-violet/60 to-brand-teal/50 blur-2xl" />
              <div className="relative size-20 rounded-3xl bg-gradient-to-br from-brand-violet to-brand-teal flex items-center justify-center shadow-glow">
                <Headset className="size-10 text-white" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="text-lg font-bold">{t('support.title')}</div>
              <p className="text-sm text-muted-foreground mt-0.5">{t('support.text')}</p>
              <Button asChild variant="teal" className="mt-3 w-full sm:w-auto">
                <a href={settings.support_telegram_link} target="_blank" rel="noreferrer">
                  <TelegramIcon /> {t('support.contact')}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button variant="secondary" className="w-full" onClick={onLogout}>
        <LogOut /> {t('auth.logout')}
      </Button>
    </div>
  )
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="text-brand-teal font-bold text-lg break-words flex justify-center">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  )
}
