import { ArrowLeft, Clock, ImagePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { TaskContent, useGetTaskQuery } from '@/entities/task'
import { TaskWork } from '@/features/task-work'
import { formatCoins } from '@/shared/lib/format'
import { Badge, Card, CardContent, Spinner } from '@/shared/ui'

export function TaskDetailsPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const { data: task, isLoading } = useGetTaskQuery(id)

  if (isLoading) return <Spinner />
  if (!task) return <p className="text-muted-foreground">{t('common.error')}</p>

  return (
    <div>
      <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-teal">
        <ArrowLeft className="size-4" /> {t('common.back')}
      </Link>

      <Card className="mt-3">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">
              {task.category.icon} {task.category.title}
            </Badge>
            <span className="text-brand-teal font-bold text-xl">{formatCoins(task.reward)}</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">{task.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" /> {task.time_limit_minutes} {t('tasks.minutes')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ImagePlus className="size-4" /> {t('submission.uploadTitle')}
            </span>
          </div>

          <TaskContent content={task.content} />
        </CardContent>
      </Card>

      <div className="mt-4">
        <TaskWork taskId={task.id} />
      </div>
    </div>
  )
}
