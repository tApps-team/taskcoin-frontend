import { useTranslation } from 'react-i18next'
import { useAdminGetWithdrawalsQuery } from '@/entities/withdrawal'
import { formatDate } from '@/shared/lib/format'
import { Card, CardContent, CoinAmount, EmptyState, Spinner, StatusBadge } from '@/shared/ui'

export function AdminWithdrawalsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminGetWithdrawalsQuery({ limit: 100 })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('admin.withdrawals.title')}</h1>

      {isLoading ? (
        <Spinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState emoji="🎁" text={t('admin.withdrawals.empty')} />
      ) : (
        <div className="space-y-3">
          {data.items.map((w) => (
            <Card key={w.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-semibold inline-flex items-center gap-2">
                    {w.denomination_label} · <CoinAmount value={w.amount} />
                  </div>
                  <div className="text-sm text-muted-foreground">{w.user.email}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(w.created_at)}</div>
                </div>
                <StatusBadge status={w.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
