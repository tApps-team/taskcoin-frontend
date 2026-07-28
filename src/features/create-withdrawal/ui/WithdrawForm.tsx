import { Check, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMeQuery } from '@/entities/session'
import { useCreateWithdrawalMutation, useGetDenominationsQuery } from '@/entities/withdrawal'
import type { Withdrawal } from '@/shared/api/types'
import { getErrorMessage } from '@/shared/lib/errors'
import { formatMoney } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button, Card, CardContent, Spinner } from '@/shared/ui'

const PLATI_INSTRUCTION =
  'https://docs.google.com/document/d/16SP70Qaq3i8Oz1llieQdLe_s25SeWuxcgqcUQEitzwI'

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="w-full flex items-center justify-between gap-2 glass-soft rounded-xl px-3 py-2 hover:bg-white/5 transition-colors"
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold flex items-center gap-2">
        {value}
        {copied ? <Check className="size-3.5 text-brand-teal" /> : <Copy className="size-3.5" />}
      </span>
    </button>
  )
}

export function WithdrawForm() {
  const { t } = useTranslation()
  const { data: me } = useMeQuery()
  const { data: denoms, isLoading } = useGetDenominationsQuery()
  const [create, { isLoading: creating }] = useCreateWithdrawalMutation()
  const [selected, setSelected] = useState<string | null>(null)
  const [issued, setIssued] = useState<Withdrawal | null>(null)
  const [error, setError] = useState('')

  const balance = me ? Number(me.balance) : 0

  const submit = async () => {
    if (!selected) return
    setError('')
    try {
      const res = await create({ denomination_id: selected }).unwrap()
      setIssued(res)
      setSelected(null)
    } catch (e) {
      setError(getErrorMessage(e, t('common.error')))
    }
  }

  if (issued) {
    return (
      <Card className="border-brand-teal/40">
        <CardContent className="p-5 space-y-3">
          <div className="text-lg font-bold text-brand-teal">
            {t('withdraw.issuedTitle')} {issued.denomination_label}
          </div>
          <p className="text-sm text-muted-foreground">{t('withdraw.issuedHint')}</p>
          {issued.card_number && <CopyRow label={t('withdraw.cardNumber')} value={issued.card_number} />}
          {issued.card_code && <CopyRow label={t('withdraw.cardCode')} value={issued.card_code} />}
          <a href={PLATI_INSTRUCTION} target="_blank" rel="noreferrer">
            <Button variant="outline" className="w-full">
              <ExternalLink /> {t('withdraw.instruction')}
            </Button>
          </a>
          <Button variant="secondary" className="w-full" onClick={() => setIssued(null)}>
            {t('common.done')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) return <Spinner />
  if (!denoms || denoms.length === 0) {
    return <p className="text-muted-foreground text-sm">{t('withdraw.noDenominations')}</p>
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {denoms.map((d) => {
          const price = Number(d.price_rub)
          const affordable = balance >= price
          const disabled = !d.available || !affordable
          return (
            <button
              key={d.id}
              disabled={disabled}
              onClick={() => setSelected(d.id)}
              className={cn(
                'rounded-2xl p-4 text-center border transition-all',
                selected === d.id
                  ? 'border-brand-violet bg-brand-violet/10'
                  : 'border-white/10 glass-soft',
                disabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              <div className="text-lg font-bold">{d.label}</div>
              <div className="text-xs text-muted-foreground">{formatMoney(price)}</div>
              {!d.available && <div className="text-[10px] text-amber-300 mt-1">{t('withdraw.outOfStock')}</div>}
            </button>
          )
        })}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button variant="teal" className="w-full" disabled={!selected || creating} onClick={submit}>
        {t('withdraw.submit')}
      </Button>
    </div>
  )
}
