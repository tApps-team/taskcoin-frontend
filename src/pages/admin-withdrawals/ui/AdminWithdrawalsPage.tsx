import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAdminGetWithdrawalsQuery,
  useAdminMarkPaidMutation,
  useAdminRejectWithdrawalMutation,
  type AdminWithdrawal,
} from '@/entities/withdrawal'
import { formatCoins, formatDate, formatMoney, maskCard } from '@/shared/lib/format'
import { Button, Card, CardContent, EmptyState, Modal, Spinner, StatusBadge, Textarea } from '@/shared/ui'

const STATUSES = ['', 'pending', 'paid', 'rejected']

export function AdminWithdrawalsPage() {
  const { t } = useTranslation()
  const [status, setStatus] = useState('pending')
  const { data, isLoading } = useAdminGetWithdrawalsQuery({ status: status || undefined, limit: 100 })
  const [markPaid] = useAdminMarkPaidMutation()
  const [rejectTarget, setRejectTarget] = useState<AdminWithdrawal | null>(null)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('admin.withdrawals.title')}</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUSES.map((s) => (
          <Button
            key={s || 'all'}
            size="sm"
            variant={status === s ? 'default' : 'secondary'}
            onClick={() => setStatus(s)}
          >
            {s ? t(`statuses.${s}`) : t('common.all')}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState emoji="💳" text={t('admin.withdrawals.empty')} />
      ) : (
        <div className="space-y-3">
          {data.items.map((w) => (
            <Card key={w.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-semibold">
                    {formatCoins(w.amount_coins)} → {formatMoney(Number(w.amount_money), w.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {w.user.email} · {maskCard(w.card_number)}
                    {w.card_holder ? ` · ${w.card_holder}` : ''}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(w.created_at)}</div>
                  {w.admin_comment && <div className="text-xs text-red-300 mt-1">{w.admin_comment}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={w.status} />
                  {w.status === 'pending' && (
                    <>
                      <Button variant="teal" size="sm" onClick={() => markPaid(w.id)}>
                        {t('admin.withdrawals.markPaid')}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setRejectTarget(w)}>
                        {t('admin.withdrawals.reject')}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {rejectTarget && <RejectModal withdrawal={rejectTarget} onClose={() => setRejectTarget(null)} />}
    </div>
  )
}

function RejectModal({ withdrawal, onClose }: { withdrawal: AdminWithdrawal; onClose: () => void }) {
  const { t } = useTranslation()
  const [reject, { isLoading }] = useAdminRejectWithdrawalMutation()
  const [comment, setComment] = useState('')

  return (
    <Modal title={t('admin.withdrawals.rejectReason')} onClose={onClose}>
      <Textarea className="min-h-[100px] mb-3" value={comment} onChange={(e) => setComment(e.target.value)} />
      <Button
        variant="destructive"
        className="w-full"
        disabled={isLoading || !comment}
        onClick={async () => {
          await reject({ id: withdrawal.id, comment })
          onClose()
        }}
      >
        {t('admin.withdrawals.reject')}
      </Button>
    </Modal>
  )
}
