import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminGetSettingsQuery, useAdminUpdateSettingsMutation } from '@/entities/app-settings'
import { Button, Card, CardContent, Input, Label, Spinner } from '@/shared/ui'

export function AdminSettingsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminGetSettingsQuery()
  const [update, { isLoading: saving }] = useAdminUpdateSettingsMutation()

  const [coinRate, setCoinRate] = useState('')
  const [minWithdrawal, setMinWithdrawal] = useState('')
  const [currency, setCurrency] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (data) {
      setCoinRate(data.coin_rate)
      setMinWithdrawal(data.min_withdrawal_coins)
      setCurrency(data.currency)
    }
  }, [data])

  if (isLoading) return <Spinner />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    await update({ coin_rate: coinRate, min_withdrawal_coins: minWithdrawal, currency }).unwrap()
    setSaved(true)
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-4">{t('admin.settings.title')}</h1>
      <Card>
        <CardContent className="p-5">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="mb-1 block">{t('admin.settings.coinRate')}</Label>
              <Input type="number" value={coinRate} onChange={(e) => setCoinRate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">{t('admin.settings.minWithdrawal')}</Label>
              <Input type="number" value={minWithdrawal} onChange={(e) => setMinWithdrawal(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">{t('admin.settings.currency')}</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Button disabled={saving}>{t('common.save')}</Button>
              {saved && <span className="text-brand-teal text-sm">✓ {t('admin.settings.saved')}</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
