import { AlertTriangle, Gift, Smartphone, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAdminCancelWithdrawalMutation,
  useAdminGetPayoutBalanceQuery,
  useAdminGetWithdrawalsQuery,
} from '@/entities/withdrawal'
import type { AdminWithdrawal } from '@/shared/api/types'
import { getErrorMessage } from '@/shared/lib/errors'
import { formatDate, formatMoney } from '@/shared/lib/format'
import {
  Button,
  Card,
  CardContent,
  CoinAmount,
  EmptyState,
  Input,
  Spinner,
  StatusBadge,
} from '@/shared/ui'

const OPERATOR_LABELS: Record<string, string> = {
  MTS: 'МТС',
  BEELINE: 'Билайн',
  MEGAFON: 'МегаФон',
  TELE2: 'Tele2',
  YOTA: 'Yota',
  TMOBILE: 'Т-Мобайл',
}

function prettyPhone(phone: string | null): string {
  if (!phone || phone.length !== 11) return phone ?? ''
  return `+${phone[0]} ${phone.slice(1, 4)} ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`
}

/** Our float at the provider. An empty one fails every payout, so it is shown
 *  at the top of the page rather than hidden in a settings screen. */
function ProviderBalance() {
  const { t } = useTranslation()
  const { data } = useAdminGetPayoutBalanceQuery()
  if (!data || !data.enabled) return null

  return (
    <Card className="mb-4">
      <CardContent className="p-4 flex items-center gap-3 flex-wrap">
        <Wallet className="size-5 text-brand-teal" />
        <span className="text-sm text-muted-foreground">{t('admin.withdrawals.providerBalance')}</span>
        {data.error ? (
          <span className="text-sm text-red-300">{data.error}</span>
        ) : data.accounts.length === 0 ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          data.accounts.map((a) => (
            <span key={a.number} className="font-semibold">
              {a.balance} {a.currency}
            </span>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function CancelControl({ w }: { w: AdminWithdrawal }) {
  const { t } = useTranslation()
  const [cancel, { isLoading }] = useAdminCancelWithdrawalMutation()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  if (w.method !== 'phone' || w.status !== 'pending') return null

  const run = async () => {
    setError('')
    try {
      await cancel({ id: w.id, reason }).unwrap()
      setOpen(false)
    } catch (e) {
      setError(getErrorMessage(e, t('common.error')))
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        {t('admin.withdrawals.cancel')}
      </Button>
    )
  }

  return (
    <div className="w-full mt-2 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-3 space-y-2">
      <div className="flex items-start gap-2 text-xs text-amber-200">
        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
        {/* Refunding a payout that did go through pays the user twice. */}
        <span>{t('admin.withdrawals.cancelWarning')}</span>
      </div>
      <Input
        placeholder={t('admin.withdrawals.cancelReason')}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" variant="destructive" disabled={isLoading} onClick={run}>
          {t('admin.withdrawals.cancelConfirm')}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  )
}

export function AdminWithdrawalsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminGetWithdrawalsQuery({ limit: 100 })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('admin.withdrawals.title')}</h1>

      <ProviderBalance />

      {isLoading ? (
        <Spinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState emoji="🎁" text={t('admin.withdrawals.empty')} />
      ) : (
        <div className="space-y-3">
          {data.items.map((w) => {
            const isPhone = w.method === 'phone'
            return (
              <Card key={w.id}>
                <CardContent className="p-4 flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-semibold inline-flex items-center gap-2">
                      {isPhone ? (
                        <Smartphone className="size-4 text-brand-teal" />
                      ) : (
                        <Gift className="size-4 text-brand-purple" />
                      )}
                      {isPhone ? prettyPhone(w.phone) : w.denomination_label} ·{' '}
                      <CoinAmount value={w.amount} />
                    </div>
                    <div className="text-sm text-muted-foreground">{w.user.email}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(w.created_at)}</div>

                    {isPhone && (
                      <div className="text-xs text-muted-foreground mt-1.5 space-y-0.5">
                        <div>
                          {OPERATOR_LABELS[w.operator ?? ''] ?? w.operator}
                          {w.provider_state && <> · {w.provider_state}</>}
                          {w.provider_ref && <> · #{w.provider_ref}</>}
                        </div>
                        {/* Two figures, not one: the row's headline amount
                            is what the user was charged, this is what the
                            carrier got. Without both, a Capitalist statement
                            cannot be reconciled against a withdrawal. */}
                        {w.payout_amount != null && (
                          <div>
                            {t('admin.withdrawals.sent')}:{' '}
                            {formatMoney(Number(w.payout_amount))}
                          </div>
                        )}
                        {w.provider_fee != null && (
                          <div>
                            {t('admin.withdrawals.fee')}: {formatMoney(Number(w.provider_fee))}
                          </div>
                        )}
                        {w.status === 'pending' && w.submit_attempts > 1 && (
                          <div className="text-amber-300">
                            {t('admin.withdrawals.attempts', { count: w.submit_attempts })}
                          </div>
                        )}
                        {w.failure_reason && (
                          <div className="text-red-300">{w.failure_reason}</div>
                        )}
                      </div>
                    )}

                    {/* Which card the user actually got — support asks this constantly. */}
                    {w.card_number && (
                      <div className="mt-1.5 font-mono text-xs select-all break-all">
                        <span className="text-muted-foreground">
                          {t('admin.withdrawals.card')}:{' '}
                        </span>
                        {w.card_number} <span className="text-muted-foreground">·</span>{' '}
                        {w.card_code}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={w.status} />
                  </div>

                  <CancelControl w={w} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
