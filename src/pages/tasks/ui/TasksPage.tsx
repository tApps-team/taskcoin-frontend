import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useGetCategoriesQuery } from '@/entities/category'
import { TaskCard, useGetTasksQuery } from '@/entities/task'
import { EmptyState, Input, SimpleSelect, TaskCardSkeleton } from '@/shared/ui'
import { listContainer, listItem } from '@/shared/lib/motion'

export function TasksPage() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
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
          onChange={(e) => {
            const v = e.target.value
            setSearch(v)
            if (v) {
              setCategory('')
              setSort('newest')
            }
          }}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState text={t('tasks.empty')} />
      ) : (
        <motion.div
          className="grid gap-3 sm:grid-cols-2"
          variants={reduce ? undefined : listContainer}
          initial={reduce ? undefined : 'hidden'}
          animate={reduce ? undefined : 'show'}
        >
          <AnimatePresence mode="popLayout">
            {data.items.map((task) => (
              <motion.div
                key={task.id}
                layout={!reduce}
                variants={reduce ? undefined : listItem}
                exit={reduce ? undefined : 'exit'}
              >
                <TaskCard task={task} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
