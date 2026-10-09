import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAdminGetReferralPercentQuery,
  useAdminUpdateReferralPercentMutation,
} from '@/entities/referral'
import { getErrorMessage } from '@/shared/lib/errors'
import { formatMoney } from '@/shared/lib/format'
import { Button, Card, CardContent, Input, Label, Spinner } from '@/shared/ui'

/** Same 500 ₽ example the users see, so both sides read the setting the same way. */
const EXAMPLE_EARNINGS = 500

export function ReferralPercentCard() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminGetReferralPercentQuery()
  const [save, { isLoading: saving }] = useAdminUpdateReferralPercentMutation()

  const [percent, setPercent] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (data) setPercent(String(Number(data.percent)))
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

  const value = Number(percent)
  const example =
    Number.isFinite(value) && value >= 0
      ? formatMoney(Math.round(EXAMPLE_EARNINGS * value) / 100)
      : null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    setError('')
    try {
      await save({ percent: percent.trim() }).unwrap()
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
          <div>
            <Label className="mb-1 block">{t('admin.settings.referral.percent')}</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className="max-w-28"
              />
              <span className="text-muted-foreground">%</span>
            </div>
            {example && (
              <p className="text-xs text-muted-foreground mt-2">
                {t('admin.settings.referral.example', { bonus: example })}
              </p>
            )}
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
