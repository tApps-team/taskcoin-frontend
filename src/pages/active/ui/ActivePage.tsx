import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useGetMySubmissionsQuery } from '@/entities/submission'
import { useCountdown } from '@/shared/lib/useCountdown'
import { CoinAmount, EmptyState, Spinner, StatusBadge } from '@/shared/ui'

function Row({ deadline, status }: { deadline: string; status: string }) {
  const { t } = useTranslation()
  const { label, expired } = useCountdown(deadline)
  if (status !== 'in_progress') return <StatusBadge status={status} />
  return (
    <span className={`font-mono font-bold ${expired ? 'text-destructive' : 'text-brand-teal'}`}>
      {expired ? t('submission.expired') : label}
    </span>
  )
}

export function ActivePage() {
  const { t } = useTranslation()
  const { data, isLoading } = useGetMySubmissionsQuery({ limit: 100 }, { pollingInterval: 30000 })

  const items = (data?.items || []).filter(
    (s) => s.status === 'in_progress' || s.status === 'submitted',
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5 tracking-tight">{t('active.title')}</h1>
      {isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState emoji="⏳" text={t('active.empty')} />
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <Link key={s.id} to={`/app/tasks/${s.task_id}`}>
              <div className="glass-soft glass-hover rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{s.task.title}</div>
                  <CoinAmount value={s.reward_snapshot} className="text-brand-teal text-sm" />
                </div>
                <Row deadline={s.deadline_at} status={s.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
