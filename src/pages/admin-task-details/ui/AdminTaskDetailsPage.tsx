import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import {
  TaskContent,
  useAdminGetTaskQuery,
  useAdminGetTaskSubmissionsQuery,
} from '@/entities/task'
import { SubmissionCard } from '@/features/review-submission'
import { formatCoins } from '@/shared/lib/format'
import {
  Card,
  CardContent,
  EmptyState,
  Spinner,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui'

export function AdminTaskDetailsPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const { data: task, isLoading } = useAdminGetTaskQuery(id)
  const { data: subs } = useAdminGetTaskSubmissionsQuery({ taskId: id })

  if (isLoading || !task) return <Spinner />

  return (
    <div>
      <Link to="/admin/tasks" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-teal">
        <ArrowLeft className="size-4" /> {t('common.back')}
      </Link>

      <div className="flex items-center justify-between mt-2 mb-4 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <div className="flex items-center gap-3">
          <span className="text-brand-teal font-bold">{formatCoins(task.reward)}</span>
          <StatusBadge status={task.status} />
        </div>
      </div>

      <Tabs defaultValue="submissions">
        <TabsList className="mb-4">
          <TabsTrigger value="submissions">{t('admin.tasks.submissionsTab')}</TabsTrigger>
          <TabsTrigger value="details">{t('admin.tasks.detailsTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          {!subs || subs.items.length === 0 ? (
            <EmptyState emoji="✅" text={t('admin.submissions.empty')} />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {subs.items.map((s) => (
                <SubmissionCard key={s.id} submission={s} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent className="p-5">
              <TaskContent content={task.content} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
