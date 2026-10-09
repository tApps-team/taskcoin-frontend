import { Check, Copy, Users } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetMyReferralsQuery } from '@/entities/referral'
import { formatDate, formatMoney } from '@/shared/lib/format'
import { copyText } from '@/shared/lib/clipboard'
import { Button, Card, CardContent, Spinner } from '@/shared/ui'

export function ReferralCard() {
  const { t } = useTranslation()
  const { data, isLoading } = useGetMyReferralsQuery()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!data || !(await copyText(data.link))) return
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-5">
          <Spinner />
        </CardContent>
      </Card>
    )
  }
  if (!data) return null

  return (
    <Card className="mb-6">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <Users className="size-5 text-brand-teal" />
          <h2 className="font-semibold">{t('referrals.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t('referrals.subtitle')}</p>

        {/* The link itself — one tap to copy is the whole point of this block. */}
        <div className="flex gap-2 items-stretch flex-col sm:flex-row">
          <div className="flex-1 min-w-0 rounded-2xl bg-white/5 px-3 py-2.5 font-mono text-sm select-all break-all">
            {data.link}
          </div>
          <Button variant="teal" onClick={copy} className="shrink-0">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? t('referrals.copied') : t('referrals.copy')}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl bg-white/5 p-3">
            <div className="text-2xl font-bold">{data.invited_count}</div>
            <div className="text-xs text-muted-foreground">{t('referrals.invited')}</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-3">
            <div className="text-2xl font-bold text-brand-teal">{formatMoney(data.earned)}</div>
            <div className="text-xs text-muted-foreground">{t('referrals.earned')}</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white/5 p-3">
          <div className="text-sm">
            {t('referrals.howItWorks', { percent: Number(data.percent) })}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {/* Same 500 ₽ example the CRM shows next to the setting. */}
            {t('referrals.example', {
              bonus: formatMoney(Math.round(500 * Number(data.percent)) / 100),
            })}
          </div>
        </div>

        {data.invited.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">{t('referrals.yourInvites')}</div>
            <div className="space-y-2">
              {data.invited.map((inv) => (
                <div
                  key={inv.id}
                  className="rounded-2xl bg-white/5 px-3 py-2 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="min-w-0">
                    <div className="text-sm truncate">{inv.email}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(inv.created_at)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm text-brand-teal">+{formatMoney(inv.bonus_paid)}</div>
                    <div className="text-xs text-muted-foreground">
                      {t('referrals.friendEarned', { amount: formatMoney(inv.earned) })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
