import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetCategoriesQuery } from '@/entities/category'
import {
  useAdminCreateTaskMutation,
  useAdminUpdateTaskMutation,
  type TaskDetail,
  type TipTapDoc,
} from '@/entities/task'
import { Button, Input, Label, Modal, SimpleSelect } from '@/shared/ui'
import { TaskEditor } from './TaskEditor'

const STATUSES = ['draft', 'active', 'deactivated', 'completed', 'archived']

export function TaskFormModal({ task, onClose }: { task: TaskDetail | null; onClose: () => void }) {
  const { t } = useTranslation()
  const { data: categories } = useGetCategoriesQuery()
  const [create, { isLoading: creating }] = useAdminCreateTaskMutation()
  const [update, { isLoading: updating }] = useAdminUpdateTaskMutation()

  const [title, setTitle] = useState(task?.title || '')
  const [categoryId, setCategoryId] = useState(task?.category.id || '')
  const [reward, setReward] = useState(task?.reward || '100')
  const [timeLimit, setTimeLimit] = useState(String(task?.time_limit_minutes ?? 60))
  const [maxCompletions, setMaxCompletions] = useState(
    task?.max_completions != null ? String(task.max_completions) : '',
  )
  const [status, setStatus] = useState<string>(task?.status || 'draft')
  const [content, setContent] = useState<TipTapDoc>(task?.content || { type: 'doc', content: [] })
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    const body: Record<string, unknown> = {
      title,
      category_id: categoryId,
      reward,
      time_limit_minutes: Number(timeLimit),
      max_completions: maxCompletions ? Number(maxCompletions) : null,
      status,
      content,
    }
    try {
      if (task) await update({ id: task.id, body }).unwrap()
      else await create(body).unwrap()
      onClose()
    } catch (e: unknown) {
      setError((e as { data?: { detail?: string } })?.data?.detail || t('common.error'))
    }
  }

  const categoryOptions = (categories ?? []).map((c) => ({ value: c.id, label: `${c.icon ?? ''} ${c.title}` }))
  const statusOptions = STATUSES.map((s) => ({ value: s, label: t(`statuses.${s}`) }))

  return (
    <Modal title={task ? t('admin.tasks.edit') : t('admin.tasks.create')} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <Label className="mb-1 block">{t('admin.tasks.name')}</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1 block">{t('admin.tasks.category')}</Label>
            <SimpleSelect value={categoryId} onValueChange={setCategoryId} options={categoryOptions} placeholder="—" />
          </div>
          <div>
            <Label className="mb-1 block">{t('admin.tasks.reward')}</Label>
            <Input type="number" value={reward} onChange={(e) => setReward(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block">{t('admin.tasks.timeLimit')}</Label>
            <Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block">{t('admin.tasks.maxCompletions')}</Label>
            <Input
              type="number"
              value={maxCompletions}
              onChange={(e) => setMaxCompletions(e.target.value)}
              placeholder={t('admin.tasks.maxCompletionsHint')}
            />
          </div>
        </div>
        <div>
          <Label className="mb-1 block">{t('admin.tasks.status')}</Label>
          <SimpleSelect value={status} onValueChange={setStatus} options={statusOptions} />
        </div>
        <div>
          <Label className="mb-1 block">{t('admin.tasks.content')}</Label>
          <TaskEditor value={content} onChange={setContent} />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button className="w-full" onClick={submit} disabled={creating || updating || !title || !categoryId}>
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  )
}
