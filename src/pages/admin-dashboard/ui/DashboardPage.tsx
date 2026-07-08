import { CheckSquare, CreditCard, ClipboardList, Users, UserX } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminDashboardQuery } from '@/entities/app-settings'
import { Card, CardContent, Spinner } from '@/shared/ui'

export function DashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminDashboardQuery()

  if (isLoading || !data) return <Spinner />

  const cards: { label: string; value: number; Icon: LucideIcon; tint: string }[] = [
    { label: t('admin.dashboard.users'), value: data.users_total, Icon: Users, tint: 'from-brand-violet to-brand-purple' },
    { label: t('admin.dashboard.blocked'), value: data.users_blocked, Icon: UserX, tint: 'from-red-500 to-rose-600' },
    { label: t('admin.dashboard.activeTasks'), value: data.tasks_active, Icon: ClipboardList, tint: 'from-brand-teal to-cyan-500' },
    { label: t('admin.dashboard.pendingSubmissions'), value: data.submissions_pending, Icon: CheckSquare, tint: 'from-brand-violet to-brand-teal' },
    { label: t('admin.dashboard.pendingWithdrawals'), value: data.withdrawals_pending, Icon: CreditCard, tint: 'from-amber-400 to-orange-500' },
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
    </div>
  )
}
