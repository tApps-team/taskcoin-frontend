import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetPublicSettingsQuery } from '@/entities/app-settings'
import { useMeQuery } from '@/entities/session'
import { useCreateWithdrawalMutation } from '@/entities/withdrawal'
import { coinsToMoney, formatMoney } from '@/shared/lib/format'
import { Button, Card, CardContent, Input, Label } from '@/shared/ui'

type FieldErrors = { amount?: string; card?: string; holder?: string }

export function WithdrawForm() {
  const { t } = useTranslation()
  const { data: me } = useMeQuery()
  const { data: settings } = useGetPublicSettingsQuery()
  const [createWithdrawal, { isLoading: creating }] = useCreateWithdrawalMutation()

  const [amount, setAmount] = useState('')
  const [card, setCard] = useState('')
  const [holder, setHolder] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')

  const balance = me ? Number(me.balance) : 0
  const coinRate = settings ? Number(settings.coin_rate) : 100
  const currency = settings?.currency || 'RUB'
  const minCoins = settings ? Number(settings.min_withdrawal_coins) : 10
  const amountNum = Number(amount) || 0
  const youGet = coinsToMoney(amountNum, coinRate)

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}
    if (!amount || amountNum <= 0) next.amount = t('withdraw.amountInvalid')
    else if (amountNum < minCoins) next.amount = t('withdraw.belowMin', { min: minCoins })
    else if (amountNum > balance) next.amount = t('withdraw.aboveBalance')
    if (card.length !== 16) next.card = t('withdraw.cardInvalid')
    if (holder.trim().length < 3) next.holder = t('withdraw.holderInvalid')
    return next
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return
    try {
      await createWithdrawal({
        amount_coins: String(amountNum),
        card_number: card,
        card_holder: holder.trim(),
      }).unwrap()
      setAmount('')
      setCard('')
      setHolder('')
      setErrors({})
    } catch (err: unknown) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail
      setFormError(typeof detail === 'string' ? detail : t('common.error'))
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={submit} className="space-y-3" noValidate>
          <div>
            <Label className="mb-1 block">{t('withdraw.amount')}</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={minCoins}
            />
            {errors.amount && <p className="text-destructive text-sm mt-1">{errors.amount}</p>}
          </div>
          <div>
            <Label className="mb-1 block">{t('withdraw.cardNumber')}</Label>
            <Input
              inputMode="numeric"
              value={card}
              onChange={(e) => setCard(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="0000000000000000"
            />
            {errors.card && <p className="text-destructive text-sm mt-1">{errors.card}</p>}
          </div>
          <div>
            <Label className="mb-1 block">{t('withdraw.cardHolder')}</Label>
            <Input value={holder} onChange={(e) => setHolder(e.target.value)} />
            {errors.holder && <p className="text-destructive text-sm mt-1">{errors.holder}</p>}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('withdraw.youGet')}:{' '}
            <span className="text-brand-teal font-semibold">{formatMoney(youGet, currency)}</span>
          </div>
          {formError && <p className="text-destructive text-sm">{formError}</p>}
          <Button className="w-full" disabled={creating}>
            {t('withdraw.create')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
