import { useTranslation } from 'react-i18next'
import { useMeQuery } from '@/entities/session'
import { useGetMyWithdrawalsQuery } from '@/entities/withdrawal'
import { WithdrawForm } from '@/features/create-withdrawal'
import { useGetPublicSettingsQuery } from '@/entities/app-settings'
import { formatDate, formatMoney } from '@/shared/lib/format'
import { Card, CardContent, CoinAmount, EmptyState, Spinner } from '@/shared/ui'

export function WithdrawPage() {
  const { t } = useTranslation()
  const { data: me } = useMeQuery()
  const { data: settings } = useGetPublicSettingsQuery()
  const { data: history, isLoading } = useGetMyWithdrawalsQuery()

  const balance = me ? Number(me.balance) : 0
  const min = settings ? Number(settings.min_withdrawal) : 0

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5 tracking-tight">{t('withdraw.title')}</h1>

      <Card className="mb-4">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-sm">{t('withdraw.balance')}</div>
            <CoinAmount value={balance} className="text-brand-teal font-bold text-2xl" />
          </div>
          <div className="text-right">
            <div className="text-muted-foreground text-sm">{t('withdraw.min')}</div>
            <div className="font-semibold">{formatMoney(min)}</div>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground mb-3">{t('withdraw.giftHint')}</p>

      <div className="mb-6">
        <WithdrawForm />
      </div>

      <h2 className="text-lg font-bold mb-3">{t('withdraw.historyTitle')}</h2>
      {isLoading ? (
        <Spinner />
      ) : !history || history.items.length === 0 ? (
        <EmptyState emoji="🎁" text={t('withdraw.empty')} />
      ) : (
        <div className="space-y-2">
          {history.items.map((w) => (
            <Card key={w.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{w.denomination_label}</div>
                  <CoinAmount value={w.amount} className="text-muted-foreground" />
                </div>
                {w.card_number && (
                  <div className="text-xs font-mono text-muted-foreground mt-1">
                    {w.card_number} / {w.card_code}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">{formatDate(w.created_at)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
