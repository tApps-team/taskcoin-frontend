import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useGetMySubmissionsQuery } from '@/entities/submission'
import { useCountdown } from '@/shared/lib/useCountdown'
import { listContainer, listItem } from '@/shared/lib/motion'
import { CoinAmount, EmptyState, ListRowSkeleton, StatusBadge } from '@/shared/ui'

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
  const reduce = useReducedMotion()
  const { data, isLoading } = useGetMySubmissionsQuery({ limit: 100 }, { pollingInterval: 30000 })

  const items = (data?.items || []).filter(
    (s) => s.status === 'in_progress' || s.status === 'submitted',
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5 tracking-tight">{t('active.title')}</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListRowSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState emoji="⏳" text={t('active.empty')} />
      ) : (
        <motion.div
          className="space-y-3"
          variants={reduce ? undefined : listContainer}
          initial={reduce ? undefined : 'hidden'}
          animate={reduce ? undefined : 'show'}
        >
          <AnimatePresence mode="popLayout">
            {items.map((s) => (
              <motion.div
                key={s.id}
                layout={!reduce}
                variants={reduce ? undefined : listItem}
                exit={reduce ? undefined : 'exit'}
              >
                <Link to={`/app/tasks/${s.task_id}`}>
                  <div className="glass-soft glass-hover rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{s.task.title}</div>
                      <CoinAmount value={s.reward_snapshot} className="text-brand-teal text-sm" />
                    </div>
                    <Row deadline={s.deadline_at} status={s.status} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
