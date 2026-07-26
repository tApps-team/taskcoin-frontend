import { Activity, CheckSquare, CreditCard, Download, Megaphone, Users, UserX, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminDashboardQuery } from '@/entities/app-settings'
import { formatMoney } from '@/shared/lib/format'
import { Card, CardContent, Spinner } from '@/shared/ui'

export function DashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminDashboardQuery()

  if (isLoading || !data) return <Spinner />

  const cards: { label: string; value: string | number; Icon: LucideIcon; tint: string }[] = [
    { label: t('admin.dashboard.users'), value: data.users_total, Icon: Users, tint: 'from-brand-violet to-brand-purple' },
    { label: t('admin.dashboard.activeToday'), value: data.users_active_today, Icon: Activity, tint: 'from-brand-teal to-cyan-500' },
    { label: t('admin.dashboard.blocked'), value: data.users_blocked, Icon: UserX, tint: 'from-red-500 to-rose-600' },
    { label: t('admin.dashboard.activeCampaigns'), value: data.campaigns_active, Icon: Megaphone, tint: 'from-brand-violet to-brand-teal' },
    { label: t('admin.dashboard.installsToday'), value: data.installs_today, Icon: Download, tint: 'from-emerald-400 to-teal-500' },
    { label: t('admin.dashboard.pendingReview'), value: data.executions_pending, Icon: CheckSquare, tint: 'from-amber-400 to-orange-500' },
    { label: t('admin.dashboard.totalBalance'), value: formatMoney(data.total_balance), Icon: Wallet, tint: 'from-brand-violet to-brand-purple' },
    { label: t('admin.dashboard.aboveThreshold'), value: data.users_above_threshold, Icon: CreditCard, tint: 'from-sky-400 to-blue-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.dashboard.title')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, Icon, tint }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className={`inline-flex rounded-2xl p-2.5 mb-3 bg-gradient-to-br ${tint} text-white shadow-lg`}>
                <Icon className="size-6" />
              </div>
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-muted-foreground text-sm mt-1">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-bold mt-8 mb-3">{t('admin.dashboard.giftStock')}</h2>
      <div className="flex flex-wrap gap-3">
        {data.gift_stock.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('admin.dashboard.noGiftStock')}</p>
        ) : (
          data.gift_stock.map((g) => (
            <Card key={g.label}>
              <CardContent className="px-5 py-3 text-center">
                <div className="text-xl font-bold">{g.count}</div>
                <div className="text-muted-foreground text-sm">{g.label}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
