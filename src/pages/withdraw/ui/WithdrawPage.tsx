import { useTranslation } from 'react-i18next'
import { useGetPublicSettingsQuery } from '@/entities/app-settings'
import { useMeQuery } from '@/entities/session'
import { useGetMyWithdrawalsQuery } from '@/entities/withdrawal'
import { WithdrawForm } from '@/features/create-withdrawal'
import { formatDate, formatMoney, maskCard } from '@/shared/lib/format'
import { Card, CardContent, CoinAmount, EmptyState, Spinner, StatusBadge } from '@/shared/ui'

export function WithdrawPage() {
  const { t } = useTranslation()
  const { data: me } = useMeQuery()
  const { data: settings } = useGetPublicSettingsQuery()
  const { data: history, isLoading } = useGetMyWithdrawalsQuery()

  const balance = me ? Number(me.balance) : 0
  const currency = settings?.currency || 'RUB'
  const minCoins = settings ? Number(settings.min_withdrawal_coins) : 10

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5 tracking-tight">{t('withdraw.title')}</h1>

      <Card className="mb-4">
        <CardContent className="p-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">{t('withdraw.balance')}</div>
            <CoinAmount value={balance} className="text-brand-teal font-bold text-lg" />
          </div>
          <div>
            <div className="text-muted-foreground">{t('withdraw.min')}</div>
            <CoinAmount value={minCoins} className="font-semibold" />
          </div>
          <div className="col-span-2 text-muted-foreground inline-flex items-center gap-1">
            {t('withdraw.rate')}: <CoinAmount value={100} /> = {formatMoney(1000, currency)}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <WithdrawForm />
      </div>

      <h2 className="text-lg font-bold mb-3">{t('withdraw.historyTitle')}</h2>
      {isLoading ? (
        <Spinner />
      ) : !history || history.items.length === 0 ? (
        <EmptyState emoji="💳" text={t('withdraw.empty')} />
      ) : (
        <div className="space-y-2">
          {history.items.map((w) => (
            <Card key={w.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <CoinAmount value={w.amount_coins} className="font-semibold" />
                  <div className="text-sm text-muted-foreground">
                    {formatMoney(Number(w.amount_money), w.currency)} · {maskCard(w.card_number)}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(w.created_at)}</div>
                  {w.status === 'rejected' && w.admin_comment && (
                    <div className="text-xs text-red-300 mt-1">{w.admin_comment}</div>
                  )}
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
