import { Headset, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useGetUserUnreadQuery } from '@/entities/feedback'
import { ReferralCard } from '@/features/referrals'
import { loggedOut, useMeQuery, useUpdateProfileMutation } from '@/entities/session'
import { baseApi } from '@/shared/api'
import { countryOptions } from '@/shared/lib/countries'
import { useGetMyStatsQuery } from '@/entities/user'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CoinAmount,
  NavBadge,
  SimpleSelect,
  Spinner,
} from '@/shared/ui'

export function ProfilePage() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data: me, isLoading } = useMeQuery()
  const { data: stats } = useGetMyStatsQuery()
  const { data: unread } = useGetUserUnreadQuery(undefined, { pollingInterval: 30000 })
  const [updateProfile] = useUpdateProfileMutation()
  // Changing the country used to give no sign it had worked at all, on the one
  // setting that decides whether any tasks show up.
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    if (!saved) return
    const id = setTimeout(() => setSaved(false), 2000)
    return () => clearTimeout(id)
  }, [saved])

  if (isLoading || !me) return <Spinner />

  const onCountry = async (value: string) => {
    try {
      await updateProfile({ country: value }).unwrap()
      setSaved(true)
    } catch {
      // Nothing to add: the select still shows what the server has.
    }
  }

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
          <Avatar className="size-16 ring-2 ring-brand-green/40">
            {me.avatar_url && <AvatarImage src={me.avatar_url} alt="" />}
            <AvatarFallback className="bg-gradient-to-br from-brand-green to-brand-grass text-white text-2xl font-bold">
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

      <ReferralCard />

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">{t('profile.country')}</div>
            {saved && <div className="text-xs text-brand-green">{t('common.saved')}</div>}
          </div>
          <SimpleSelect
            className="w-full"
            value={me.country || ''}
            onValueChange={onCountry}
            placeholder={t('auth.countryPlaceholder')}
            options={countryOptions(me.country)}
          />
          <p className="text-xs text-muted-foreground mt-1.5">{t('profile.countryHint')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-gradient-to-br from-brand-green/30 to-brand-grass/20 blur-3xl" />
        <CardContent className="p-5 relative flex flex-col sm:flex-row items-center gap-4">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-green/60 to-brand-grass/50 blur-2xl" />
            <div className="relative size-20 rounded-3xl bg-gradient-to-br from-brand-green to-brand-grass flex items-center justify-center shadow-glow">
              <Headset className="size-10 text-white" />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-lg font-bold">{t('support.title')}</div>
            <p className="text-sm text-muted-foreground mt-0.5">{t('support.text')}</p>
            <Button asChild variant="action" className="relative mt-3 w-full sm:w-auto">
              <Link to="/app/feedback">
                <Headset className="size-4" /> {t('feedback.open')}
                <NavBadge count={unread?.count} />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button variant="secondary" className="w-full" onClick={onLogout}>
        <LogOut /> {t('auth.logout')}
      </Button>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="text-brand-green font-bold text-lg break-words flex justify-center">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  )
}
