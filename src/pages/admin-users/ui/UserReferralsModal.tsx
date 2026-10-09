import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminGetUserReferralsQuery } from '@/entities/referral'
import type { AdminUser } from '@/shared/api/types'
import { copyText } from '@/shared/lib/clipboard'
import { formatDate, formatMoney } from '@/shared/lib/format'
import { Button, EmptyState, Modal, Spinner } from '@/shared/ui'

export function UserReferralsModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminGetUserReferralsQuery(user.id)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!data || !(await copyText(data.link))) return
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal title={`${t('admin.users.referrals')} · ${user.email}`} onClose={onClose}>
      {isLoading || !data ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1.5">{t('admin.users.referralLink')}</div>
            <div className="flex gap-2 items-stretch flex-col sm:flex-row">
              <div className="flex-1 min-w-0 rounded-xl bg-white/5 px-3 py-2 font-mono text-xs select-all break-all">
                {data.link}
              </div>
              <Button size="sm" variant="secondary" onClick={copy} className="shrink-0">
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? t('referrals.copied') : t('referrals.copy')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-xl font-bold">{data.invited_count}</div>
              <div className="text-xs text-muted-foreground">{t('referrals.invited')}</div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-xl font-bold text-brand-teal">{formatMoney(data.earned)}</div>
              <div className="text-xs text-muted-foreground">{t('admin.users.referralEarned')}</div>
            </div>
          </div>

          {/* Who brought this user in — useful when chasing fraud rings. */}
          {data.invited_by && (
            <div className="rounded-xl bg-white/5 px-3 py-2">
              <div className="text-xs text-muted-foreground">{t('admin.users.invitedBy')}</div>
              <div className="text-sm">{data.invited_by.email}</div>
              <div className="text-xs text-muted-foreground">
                {t('admin.users.broughtBonus', { amount: formatMoney(data.invited_by.bonus_paid) })}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm font-medium mb-2">{t('referrals.yourInvites')}</div>
            {data.invited.length === 0 ? (
              <EmptyState emoji="👥" text={t('admin.users.noReferrals')} />
            ) : (
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {data.invited.map((inv) => (
                  <div
                    key={inv.id}
                    className="rounded-xl bg-white/5 px-3 py-2 flex items-center justify-between gap-3 flex-wrap"
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
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
