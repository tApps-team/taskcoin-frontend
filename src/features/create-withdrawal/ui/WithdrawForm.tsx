import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetPublicSettingsQuery } from '@/entities/app-settings'
import { useMeQuery } from '@/entities/session'
import { useCreateWithdrawalMutation } from '@/entities/withdrawal'
import { coinsToMoney, formatMoney } from '@/shared/lib/format'
import { Button, Card, CardContent, Input, Label } from '@/shared/ui'

export function WithdrawForm() {
  const { t } = useTranslation()
  const { data: me } = useMeQuery()
  const { data: settings } = useGetPublicSettingsQuery()
  const [createWithdrawal, { isLoading: creating }] = useCreateWithdrawalMutation()

  const [amount, setAmount] = useState('')
  const [card, setCard] = useState('')
  const [holder, setHolder] = useState('')
  const [error, setError] = useState('')

  const balance = me ? Number(me.balance) : 0
  const coinRate = settings ? Number(settings.coin_rate) : 100
  const currency = settings?.currency || 'RUB'
  const minCoins = settings ? Number(settings.min_withdrawal_coins) : 5000
  const amountNum = Number(amount) || 0
  const youGet = coinsToMoney(amountNum, coinRate)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (amountNum < minCoins) return setError(t('withdraw.belowMin'))
    if (amountNum > balance) return setError(t('withdraw.aboveBalance'))
    try {
      await createWithdrawal({
        amount_coins: String(amountNum),
        card_number: card.replace(/\s/g, ''),
        card_holder: holder || undefined,
      }).unwrap()
      setAmount('')
      setCard('')
      setHolder('')
    } catch (e: unknown) {
      const detail = (e as { data?: { detail?: string } })?.data?.detail
      setError(typeof detail === 'string' ? detail : t('common.error'))
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label className="mb-1 block">{t('withdraw.amount')}</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min={minCoins} />
          </div>
          <div>
            <Label className="mb-1 block">{t('withdraw.cardNumber')}</Label>
            <Input value={card} onChange={(e) => setCard(e.target.value)} placeholder="0000 0000 0000 0000" maxLength={19} />
          </div>
          <div>
            <Label className="mb-1 block">{t('withdraw.cardHolder')}</Label>
            <Input value={holder} onChange={(e) => setHolder(e.target.value)} />
          </div>
          <div className="text-sm text-muted-foreground">
            {t('withdraw.youGet')}:{' '}
            <span className="text-brand-teal font-semibold">{formatMoney(youGet, currency)}</span>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button className="w-full" disabled={creating}>
            {t('withdraw.create')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
