import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminDeleteNewsMutation, useAdminGetNewsQuery, type NewsArticle } from '@/entities/news'
import { NewsModal } from '@/features/manage-news'
import { Button, Card, CardContent, EmptyState, Spinner, StatusBadge } from '@/shared/ui'

export function AdminNewsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminGetNewsQuery()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<NewsArticle | null>(null)
  const [remove] = useAdminDeleteNewsMutation()

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{t('admin.news.pageTitle')}</h1>
        <Button onClick={() => setCreating(true)}>
          <Plus /> {t('admin.news.create')}
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data || data.length === 0 ? (
        <EmptyState emoji="📰" text={t('admin.news.empty')} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.map((n) => (
            <Card key={n.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="size-12 rounded-xl shrink-0 overflow-hidden" style={{ background: n.accent || '#7c5cff' }}>
                  {n.cover_url && <img src={n.cover_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{n.title}</div>
                  <div className="mt-1">
                    <StatusBadge status={n.is_published ? 'active' : 'draft'} />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(n)}>
                    {t('common.edit')}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => confirm(t('admin.news.confirmDelete')) && remove(n.id)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {creating && <NewsModal onClose={() => setCreating(false)} />}
      {editing && <NewsModal article={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
