import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useGetCategoriesQuery } from '@/entities/category'
import {
  useAdminDeleteTaskMutation,
  useAdminGetTasksQuery,
  useAdminSetTaskStatusMutation,
  type TaskDetail,
} from '@/entities/task'
import { TaskFormModal } from '@/features/manage-tasks'
import {
  Button,
  Card,
  CoinAmount,
  SimpleSelect,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

const STATUSES = ['draft', 'active', 'deactivated', 'completed', 'archived']

export function AdminTasksPage() {
  const { t } = useTranslation()
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const { data, isLoading } = useAdminGetTasksQuery({
    status: status || undefined,
    category: category || undefined,
    limit: 100,
  })
  const { data: categories } = useGetCategoriesQuery()
  const [setTaskStatus] = useAdminSetTaskStatusMutation()
  const [deleteTask] = useAdminDeleteTaskMutation()

  const [editing, setEditing] = useState<TaskDetail | 'new' | null>(null)

  const statusFilterOptions = [
    { value: '', label: t('common.all') },
    ...STATUSES.map((s) => ({ value: s, label: t(`statuses.${s}`) })),
  ]
  const categoryFilterOptions = [
    { value: '', label: t('common.all') },
    ...(categories?.map((c) => ({ value: c.code, label: `${c.icon ?? ''} ${c.title}` })) ?? []),
  ]
  const statusOptions = STATUSES.map((s) => ({ value: s, label: t(`statuses.${s}`) }))

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{t('admin.tasks.title')}</h1>
        <Button onClick={() => setEditing('new')}>
          <Plus /> {t('admin.tasks.create')}
        </Button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <SimpleSelect className="w-[180px]" value={status} onValueChange={setStatus} options={statusFilterOptions} />
        <SimpleSelect className="w-[200px]" value={category} onValueChange={setCategory} options={categoryFilterOptions} />
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.tasks.name')}</TableHead>
                <TableHead>{t('admin.tasks.category')}</TableHead>
                <TableHead>{t('admin.tasks.reward')}</TableHead>
                <TableHead>{t('admin.tasks.completions')}</TableHead>
                <TableHead>{t('admin.tasks.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium max-w-xs">
                    <Link to={`/admin/tasks/${task.id}`} className="hover:text-brand-teal">
                      {task.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {task.category.icon} {task.category.title}
                  </TableCell>
                  <TableCell>
                    <CoinAmount value={task.reward} className="text-brand-teal" />
                  </TableCell>
                  <TableCell>
                    {task.completions_count}
                    {task.max_completions ? ` / ${task.max_completions}` : ''}
                  </TableCell>
                  <TableCell>
                    <SimpleSelect
                      className="w-[150px] h-8"
                      value={task.status}
                      onValueChange={(v) => setTaskStatus({ id: task.id, status: v })}
                      options={statusOptions}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => setEditing(task)}>
                        {t('common.edit')}
                      </Button>
                      <Button size="sm" variant="secondary" asChild>
                        <Link to={`/admin/tasks/${task.id}`}>{t('admin.tasks.submissionsTab')}</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => confirm(t('admin.tasks.confirmDelete')) && deleteTask(task.id)}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {editing && <TaskFormModal task={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
