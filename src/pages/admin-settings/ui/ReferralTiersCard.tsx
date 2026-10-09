import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAdminGetReferralTiersQuery,
  useAdminUpdateReferralTiersMutation,
} from '@/entities/referral'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button, Card, CardContent, Input, Label, Spinner } from '@/shared/ui'

interface Row {
  threshold: string
  bonus: string
}

/** Percent the bonus represents, for the hint next to each row. */
function percentOf(row: Row): string | null {
  const threshold = Number(row.threshold)
  const bonus = Number(row.bonus)
  if (!Number.isFinite(threshold) || !Number.isFinite(bonus) || threshold <= 0) return null
  const pct = (bonus / threshold) * 100
  return `${Math.round(pct * 100) / 100}%`
}

export function ReferralTiersCard() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminGetReferralTiersQuery()
  const [save, { isLoading: saving }] = useAdminUpdateReferralTiersMutation()

  const [rows, setRows] = useState<Row[]>([])
  const [percent, setPercent] = useState('10')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (data) setRows(data.map((d) => ({ threshold: String(Number(d.threshold)), bonus: String(Number(d.bonus)) })))
  }, [data])

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-5">
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const addRow = () => setRows((rs) => [...rs, { threshold: '', bonus: '' }])
  const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i))

  // Fill every bonus from one percentage — the usual way these are set.
  const applyPercent = () => {
    const pct = Number(percent)
    if (!Number.isFinite(pct) || pct < 0) return
    setRows((rs) =>
      rs.map((r) => {
        const threshold = Number(r.threshold)
        if (!Number.isFinite(threshold) || threshold <= 0) return r
        return { ...r, bonus: String(Math.round(threshold * pct) / 100) }
      }),
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    setError('')
    const tiers = rows
      .filter((r) => r.threshold.trim() && r.bonus.trim())
      .map((r) => ({ threshold: r.threshold.trim(), bonus: r.bonus.trim() }))
    if (tiers.length === 0) {
      setError(t('admin.settings.referral.needOne'))
      return
    }
    try {
      await save({ tiers }).unwrap()
      setSaved(true)
    } catch (err) {
      setError(getErrorMessage(err, t('admin.settings.referral.saveError')))
    }
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-5">
        <h2 className="font-semibold mb-1">{t('admin.settings.referral.title')}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t('admin.settings.referral.hint')}</p>

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-muted-foreground">
            <div>{t('admin.settings.referral.threshold')}</div>
            <div>{t('admin.settings.referral.bonus')}</div>
            <div />
          </div>

          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
              <Input
                type="number"
                min={1}
                value={row.threshold}
                onChange={(e) => setRow(i, { threshold: e.target.value })}
                placeholder="500"
              />
              <div>
                <Input
                  type="number"
                  min={0}
                  value={row.bonus}
                  onChange={(e) => setRow(i, { bonus: e.target.value })}
                  placeholder="50"
                />
                {percentOf(row) && (
                  <div className="text-xs text-muted-foreground mt-1 pl-1">{percentOf(row)}</div>
                )}
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={() => removeRow(i)}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}

          <Button type="button" size="sm" variant="secondary" onClick={addRow}>
            <Plus className="size-3.5" /> {t('admin.settings.referral.addTier')}
          </Button>

          <div className="border-t border-white/10 pt-3">
            <Label className="mb-1 block">{t('admin.settings.referral.fromPercent')}</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min={0}
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className="max-w-24"
              />
              <span className="text-muted-foreground">%</span>
              <Button type="button" size="sm" variant="secondary" onClick={applyPercent}>
                {t('admin.settings.referral.apply')}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button disabled={saving}>{t('common.save')}</Button>
            {saved && <span className="text-brand-teal text-sm">✓ {t('admin.settings.saved')}</span>}
            {error && <span className="text-red-400 text-sm">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
