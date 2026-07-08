import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetCategoriesQuery } from '@/entities/category'
import { TaskCard, useGetTasksQuery } from '@/entities/task'
import { EmptyState, Input, SimpleSelect, Spinner } from '@/shared/ui'

export function TasksPage() {
  const { t } = useTranslation()
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')

  const { data: categories } = useGetCategoriesQuery()
  const { data, isLoading } = useGetTasksQuery({
    category: category || undefined,
    sort,
    search: search || undefined,
  })

  const categoryOptions = [
    { value: '', label: t('common.all') },
    ...(categories?.map((c) => ({ value: c.code, label: `${c.icon ?? ''} ${c.title}` })) ?? []),
  ]
  const sortOptions = [
    { value: 'newest', label: t('tasks.sortNewest') },
    { value: 'reward_desc', label: t('tasks.sortRewardDesc') },
    { value: 'reward_asc', label: t('tasks.sortRewardAsc') },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5 tracking-tight">{t('tasks.title')}</h1>

      <div className="flex flex-wrap gap-2 mb-5">
        <SimpleSelect className="w-[180px]" value={category} onValueChange={setCategory} options={categoryOptions} />
        <SimpleSelect className="w-[220px]" value={sort} onValueChange={setSort} options={sortOptions} />
        <Input
          className="flex-1 min-w-[160px]"
          placeholder={t('tasks.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState text={t('tasks.empty')} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.items.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
