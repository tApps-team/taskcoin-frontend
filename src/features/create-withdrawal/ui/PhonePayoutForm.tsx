import { Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMeQuery } from '@/entities/session'
import {
  useCreatePhoneWithdrawalMutation,
  useGetPhonePayoutOptionsQuery,
  useGetPhonePayoutQuoteQuery,
} from '@/entities/withdrawal'
import type { MobileOperator } from '@/shared/api/types'
import { getErrorMessage } from '@/shared/lib/errors'
import { formatMoney } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button, Card, CardContent, Input, Label, Spinner } from '@/shared/ui'

// Shown as-is: these are brand names, not translatable strings.
const OPERATOR_LABELS: Record<MobileOperator, string> = {
  MTS: 'МТС',
  BEELINE: 'Билайн',
  MEGAFON: 'МегаФон',
  TELE2: 'Tele2',
  YOTA: 'Yota',
  TMOBILE: 'Т-Мобайл',
}

/** Keep only digits and render them as +7 900 123-45-67 while typing. */
function formatPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('8')) digits = '7' + digits.slice(1)
  if (digits.length && !digits.startsWith('7')) digits = '7' + digits
  digits = digits.slice(0, 11)
  if (digits.length <= 1) return digits ? '+7' : ''
  const rest = digits.slice(1)
  let out = '+7'
  if (rest.length) out += ' ' + rest.slice(0, 3)
  if (rest.length > 3) out += ' ' + rest.slice(3, 6)
  if (rest.length > 6) out += '-' + rest.slice(6, 8)
  if (rest.length > 8) out += '-' + rest.slice(8, 10)
  return out
}

function digitsOf(formatted: string): string {
  return formatted.replace(/\D/g, '')
}

export function PhonePayoutForm() {
  const { t } = useTranslation()
  const { data: me } = useMeQuery()
  const { data: options, isLoading } = useGetPhonePayoutOptionsQuery()
  const [create, { isLoading: creating }] = useCreatePhoneWithdrawalMutation()

  const [phone, setPhone] = useState('')
  const [operator, setOperator] = useState<MobileOperator | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [queued, setQueued] = useState(false)
  const [lastQuote, setLastQuote] = useState<{ amount: string; payout: string } | null>(null)

  // Asked of the server rather than worked out here: the split has to be the
  // one the payout will actually use, down to the kopeck.
  const { data: quote } = useGetPhonePayoutQuoteQuery(amount, {
    skip: !amount || Number(amount) <= 0,
  })

  if (isLoading) return <Spinner />
  if (!options || !options.enabled) {
    return <p className="text-sm text-muted-foreground">{t('withdraw.phone.unavailable')}</p>
  }

  const balance = me ? Number(me.balance) : 0
  const min = Number(options.min_amount)
  const max = Number(options.max_amount)
  // Never offer more than the account holds, nor more than one payout allows.
  const maxAllowed = Math.min(max, Math.floor(balance))
  // Below the minimum there is no range to speak of: printing one would read
  // "from 231 to 116", which is not a limit but a contradiction.
  const canAfford = maxAllowed >= min
  const value = Number(amount)

  const phoneReady = digitsOf(phone).length === 11
  const amountReady = Number.isFinite(value) && value >= min && value <= maxAllowed
  const ready = phoneReady && !!operator && amountReady

  const submit = async () => {
    if (!ready || !operator) return
    setError('')
    try {
      const created = await create({
        amount: String(value),
        phone: digitsOf(phone),
        operator,
      }).unwrap()
      setLastQuote({
        amount: created.amount,
        payout: created.payout_amount ?? String(value),
      })
      setQueued(true)
      setPhone('')
      setOperator(null)
      setAmount('')
    } catch (e) {
      setError(getErrorMessage(e, t('common.error')))
    }
  }

  if (queued) {
    return (
      <Card className="border-brand-green/40">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-brand-green font-bold text-lg">
            <Smartphone className="size-5" /> {t('withdraw.phone.queuedTitle')}
          </div>
          {lastQuote && (
            <p className="text-sm">
              <span className="font-bold">{formatMoney(Number(lastQuote.payout))}</span>{' '}
              <span className="text-muted-foreground">
                {t('withdraw.phone.arrivedOf', { total: formatMoney(Number(lastQuote.amount)) })}
              </span>
            </p>
          )}
          <p className="text-sm text-muted-foreground">{t('withdraw.phone.queuedHint')}</p>
          <Button variant="secondary" className="w-full" onClick={() => setQueued(false)}>
            {t('common.done')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-1.5 block">{t('withdraw.phone.number')}</Label>
        <Input
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 900 123-45-67"
          value={phone}
          onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
        />
      </div>

      <div>
        <Label className="mb-1.5 block">{t('withdraw.phone.operator')}</Label>
        {/* Chosen by hand on purpose: after number portability the prefix no
            longer tells you which carrier a number belongs to. */}
        <div className="grid grid-cols-3 gap-2">
          {options.operators.map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => setOperator(op)}
              className={cn(
                'rounded-2xl py-2.5 text-sm border transition-all',
                operator === op
                  ? 'border-brand-green bg-brand-green/10'
                  : 'border-ink/10 glass-soft hover:bg-ink/[0.035]',
              )}
            >
              {OPERATOR_LABELS[op] ?? op}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">{t('withdraw.phone.operatorHint')}</p>
      </div>

      <div>
        <Label className="mb-1.5 block">{t('withdraw.phone.amount')}</Label>
        <div className="flex gap-2">
          <Input
            inputMode="numeric"
            placeholder={String(min)}
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
          />
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            disabled={!canAfford}
            onClick={() => setAmount(String(maxAllowed))}
          >
            {t('withdraw.phone.all')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {t('withdraw.phone.limits', {
            min: formatMoney(min),
            max: formatMoney(Math.min(max, Math.max(maxAllowed, 0))),
          })}
        </p>

        <p className="text-xs text-muted-foreground mt-1">
          {t('withdraw.phone.feeNote', { percent: Number(options.fee_percent) })}
        </p>

        {/* Shown before the button, not after: the amount that reaches the
            phone is lower than the amount typed, and finding that out from the
            history afterwards would feel like a bait. */}
        {quote && amountReady && (
          <div className="mt-3 rounded-2xl glass-soft border border-ink/10 p-3 space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                {t('withdraw.phone.willArrive')}
              </span>
              <span className="text-lg font-bold text-brand-green">
                {formatMoney(Number(quote.payout_amount))}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-muted-foreground">{t('withdraw.phone.feeLine')}</span>
              <span className="text-xs text-muted-foreground">
                −{formatMoney(Number(quote.fee))}
              </span>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button variant="action" className="w-full" disabled={!ready || creating} onClick={submit}>
        {t('withdraw.phone.submit')}
      </Button>
    </div>
  )
}
