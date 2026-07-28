import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useGetArticleQuery } from '@/entities/news'
import { formatDate } from '@/shared/lib/format'
import { Spinner } from '@/shared/ui'
import { RichTextContent } from '@/shared/ui/rich-text'

export function NewsArticlePage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const { data, isLoading } = useGetArticleQuery(id)

  if (isLoading) return <Spinner />
  if (!data) return <div className="text-muted-foreground">{t('news.notFound')}</div>

  return (
    <div className="-mt-4 md:mt-0">
      {data.cover_url && (
        <div
          className="relative h-48 md:h-56 md:rounded-3xl overflow-hidden -mx-4 md:mx-0 mb-4"
          style={{ background: data.accent || '#7c5cff' }}
        >
          <img src={data.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      )}

      <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-teal mb-3">
        <ArrowLeft className="size-4" /> {t('common.back')}
      </Link>

      <div className="flex items-start justify-between gap-3 mb-3">
        <h1 className="text-2xl font-bold tracking-tight">{data.title}</h1>
        {data.published_at && (
          <span className="text-xs text-muted-foreground shrink-0 mt-2 glass-soft rounded-lg px-2 py-1">
            {formatDate(data.published_at).split(',')[0]}
          </span>
        )}
      </div>

      <RichTextContent content={data.body} />
    </div>
  )
}
