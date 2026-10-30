import { Gift, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMeQuery } from '@/entities/session'
import { useGetMyWithdrawalsQuery, useGetPhonePayoutOptionsQuery } from '@/entities/withdrawal'
import { PhonePayoutForm, WithdrawForm } from '@/features/create-withdrawal'
import { useGetPublicSettingsQuery } from '@/entities/app-settings'
import type { Withdrawal } from '@/shared/api/types'
import { formatDate, formatMoney } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import {
  Card,
  CardContent,
  CoinAmount,
  EmptyState,
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

function HistoryRow({ w }: { w: Withdrawal }) {
  const { t } = useTranslation()
  const isPhone = w.method === 'phone'
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold inline-flex items-center gap-2 min-w-0">
            {isPhone ? (
              <Smartphone className="size-4 shrink-0 text-brand-green" />
            ) : (
              <Gift className="size-4 shrink-0 text-brand-brown" />
            )}
            <span className="truncate">
              {isPhone ? prettyPhone(w.phone) : w.denomination_label}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CoinAmount value={w.amount} className="text-muted-foreground" />
            {/* A phone payout is not instant, so its state has to be visible. */}
            {isPhone && <StatusBadge status={w.status} />}
          </div>
        </div>

        {isPhone && w.operator && (
          <div className="text-xs text-muted-foreground mt-1">
            {OPERATOR_LABELS[w.operator] ?? w.operator}
            {/* The debited figure is the headline above; this is what the
                carrier received, so the fee is never a surprise after the
                fact. Older rows have no split and simply omit it. */}
            {w.payout_amount && (
              <>
                {' · '}
                {formatMoney(Number(w.payout_amount))}{' '}
                {t('withdraw.phone.arrivedOf', { total: formatMoney(Number(w.amount)) })}
              </>
            )}
          </div>
        )}
        {!isPhone && w.card_number && (
          <div className="text-xs font-mono text-muted-foreground mt-1">
            {w.card_number} / {w.card_code}
          </div>
        )}
        {w.status === 'rejected' && (
          <div className="text-xs text-red-600 mt-1">
            {w.failure_reason || t('withdraw.phone.refunded')}
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-1">{formatDate(w.created_at)}</div>
      </CardContent>
    </Card>
  )
}

export function WithdrawPage() {
  const { t } = useTranslation()
  const { data: me } = useMeQuery()
  const { data: settings } = useGetPublicSettingsQuery()
  const { data: history, isLoading } = useGetMyWithdrawalsQuery()
  const { data: phoneOptions } = useGetPhonePayoutOptionsQuery()
  const [method, setMethod] = useState<'gift_code' | 'phone'>('gift_code')

  const balance = me ? Number(me.balance) : 0
  const min = settings ? Number(settings.min_withdrawal) : 0
  const phoneEnabled = !!phoneOptions?.enabled

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5 tracking-tight">{t('withdraw.title')}</h1>

      <Card className="mb-4">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-sm">{t('withdraw.balance')}</div>
            <CoinAmount value={balance} className="text-brand-green font-bold text-2xl" />
          </div>
          <div className="text-right">
            <div className="text-muted-foreground text-sm">{t('withdraw.min')}</div>
            <div className="font-semibold">{formatMoney(min)}</div>
          </div>
        </CardContent>
      </Card>

      {/* The switcher only earns its place once there is a second method. */}
      {phoneEnabled && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(
            [
              ['phone', t('withdraw.phone.tab'), Smartphone],
              ['gift_code', t('withdraw.giftTab'), Gift],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setMethod(key)}
              className={cn(
                'rounded-2xl py-3 border transition-all inline-flex items-center justify-center gap-2 text-sm font-medium',
                method === key
                  ? 'border-brand-green bg-brand-green/10'
                  : 'border-ink/10 glass-soft hover:bg-ink/[0.035]',
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-3">
        {method === 'phone' && phoneEnabled ? t('withdraw.phone.hint') : t('withdraw.giftHint')}
      </p>

      <div className="mb-6">
        {method === 'phone' && phoneEnabled ? <PhonePayoutForm /> : <WithdrawForm />}
      </div>

      <h2 className="text-lg font-bold mb-3">{t('withdraw.historyTitle')}</h2>
      {isLoading ? (
        <Spinner />
      ) : !history || history.items.length === 0 ? (
        <EmptyState emoji="🎁" text={t('withdraw.empty')} />
      ) : (
        <div className="space-y-2">
          {history.items.map((w) => (
            <HistoryRow key={w.id} w={w} />
          ))}
        </div>
      )}
    </div>
  )
}
