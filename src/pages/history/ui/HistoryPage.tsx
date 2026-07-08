import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetMySubmissionsQuery } from '@/entities/submission'
import { formatCoins, formatDate } from '@/shared/lib/format'
import { Button, Card, CardContent, EmptyState, Spinner, StatusBadge } from '@/shared/ui'

const STATUSES = ['', 'approved', 'rejected', 'expired'] as const

export function HistoryPage() {
  const { t } = useTranslation()
  const [status, setStatus] = useState('')
  const { data, isLoading } = useGetMySubmissionsQuery({ status: status || undefined, limit: 100 })

  const items = (data?.items || []).filter((s) =>
    status ? true : ['approved', 'rejected', 'expired'].includes(s.status),
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5 tracking-tight">{t('history.title')}</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUSES.map((s) => (
          <Button
            key={s || 'all'}
            size="sm"
            variant={status === s ? 'default' : 'secondary'}
            onClick={() => setStatus(s)}
          >
            {s ? t(`statuses.${s}`) : t('history.filterAll')}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState emoji="🕓" text={t('history.empty')} />
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{s.task.title}</div>
                  <StatusBadge status={s.status} />
                </div>
                <div className="flex items-center justify-between mt-1 text-sm">
                  <span className="text-brand-teal">{formatCoins(s.reward_snapshot)}</span>
                  <span className="text-muted-foreground">
                    {formatDate(s.reviewed_at || s.submitted_at || s.started_at)}
                  </span>
                </div>
                {s.status === 'rejected' && s.reviewer_comment && (
                  <div className="mt-2 text-sm text-red-300 bg-destructive/10 rounded-xl px-3 py-2">
                    {t('history.rejectedReason')}: {s.reviewer_comment}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
