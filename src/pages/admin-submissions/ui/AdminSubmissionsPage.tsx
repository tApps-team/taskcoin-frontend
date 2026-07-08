import { useTranslation } from 'react-i18next'
import { useAdminGetSubmissionsQuery } from '@/entities/submission'
import { SubmissionCard } from '@/features/review-submission'
import { EmptyState, Spinner } from '@/shared/ui'

export function AdminSubmissionsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminGetSubmissionsQuery(
    { status: 'submitted', limit: 100 },
    { pollingInterval: 30000 },
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('admin.submissions.title')}</h1>
      {isLoading ? (
        <Spinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState emoji="✅" text={t('admin.submissions.empty')} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.items.map((s) => (
            <SubmissionCard key={s.id} submission={s} />
          ))}
        </div>
      )}
    </div>
  )
}
