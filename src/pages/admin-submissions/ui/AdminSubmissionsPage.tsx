import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminGetSubmissionsQuery } from '@/entities/submission'
import { SubmissionCard } from '@/features/review-submission'
import { Button, EmptyState, Input, SimpleSelect, Spinner } from '@/shared/ui'

const PAGE = 20
const STATUSES = ['', 'submitted', 'approved', 'rejected', 'expired'] as const

export function AdminSubmissionsPage() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<string>('submitted')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [offset, setOffset] = useState(0)

  const { data, isLoading } = useAdminGetSubmissionsQuery(
    {
      status: status || undefined,
      search: search.trim() || undefined,
      sort,
      limit: PAGE,
      offset,
    },
    { pollingInterval: 30000 },
  )

  const empty =
    status === 'submitted' && !search.trim()
      ? t('admin.submissions.empty')
      : t('admin.submissions.emptyFiltered')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('admin.submissions.title')}</h1>

      <div className="flex gap-2 mb-3 flex-wrap">
        {STATUSES.map((s) => (
          <Button
            key={s || 'all'}
            size="sm"
            variant={status === s ? 'default' : 'secondary'}
            onClick={() => {
              setStatus(s)
              setOffset(0)
            }}
          >
            {s ? t(`statuses.${s}`) : t('admin.submissions.filterAll')}
          </Button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Input
          className="max-w-sm"
          placeholder={t('admin.submissions.searchUser')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setOffset(0)
          }}
        />
        <SimpleSelect
          className="w-44"
          value={sort}
          onValueChange={(v) => {
            setSort(v)
            setOffset(0)
          }}
          options={[
            { value: 'newest', label: t('admin.submissions.sortNewest') },
            { value: 'oldest', label: t('admin.submissions.sortOldest') },
          ]}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState emoji="✅" text={empty} />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {data.items.map((s) => (
              <SubmissionCard key={s.id} submission={s} />
            ))}
          </div>

          {data.total > PAGE && (
            <div className="flex items-center gap-3 mt-4">
              <Button
                size="icon"
                variant="secondary"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE))}
              >
                <ChevronLeft />
              </Button>
              <span className="text-muted-foreground text-sm">
                {offset + 1}–{Math.min(offset + PAGE, data.total)} / {data.total}
              </span>
              <Button
                size="icon"
                variant="secondary"
                disabled={offset + PAGE >= data.total}
                onClick={() => setOffset(offset + PAGE)}
              >
                <ChevronRight />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
