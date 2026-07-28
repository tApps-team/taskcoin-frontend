import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminUploadImageMutation } from '@/entities/application'
import {
  useAdminCreateNewsMutation,
  useAdminUpdateNewsMutation,
  type NewsArticle,
} from '@/entities/news'
import type { TipTapDoc } from '@/shared/api/types'
import { EMPTY_DOC } from '@/shared/lib/tiptap'
import { cn } from '@/shared/lib/utils'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button, Input, Label, Modal } from '@/shared/ui'
import { RichTextEditor } from './RichTextEditor'

const PRESET_COLORS = ['#7c5cff', '#f4a640', '#8b7be8', '#4caf82', '#e8709a', '#3aa8c1']

export function NewsModal({ article, onClose }: { article?: NewsArticle | null; onClose: () => void }) {
  const { t } = useTranslation()
  const [create, { isLoading: creating }] = useAdminCreateNewsMutation()
  const [update, { isLoading: updating }] = useAdminUpdateNewsMutation()
  const [uploadImage, { isLoading: uploading }] = useAdminUploadImageMutation()

  const [title, setTitle] = useState(article?.title || '')
  const [coverUrl, setCoverUrl] = useState<string | null>(article?.cover_url || null)
  const [accent, setAccent] = useState(article?.accent || PRESET_COLORS[0])
  const [body, setBody] = useState<TipTapDoc>(article?.body && Object.keys(article.body).length ? article.body : EMPTY_DOC)
  const [published, setPublished] = useState(article?.is_published ?? true)
  const [publishedAt, setPublishedAt] = useState(article?.published_at || '')
  const [error, setError] = useState('')

  const onCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await uploadImage(form).unwrap()
      setCoverUrl(res.url)
    } catch {
      setError(t('common.error'))
    }
    e.target.value = ''
  }

  const save = async () => {
    setError('')
    const payload = {
      title,
      cover_url: coverUrl,
      accent,
      body,
      is_published: published,
      published_at: publishedAt || null,
    }
    try {
      if (article) await update({ id: article.id, body: payload }).unwrap()
      else await create(payload).unwrap()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, t('common.error')))
    }
  }

  return (
    <Modal title={article ? t('admin.news.edit') : t('admin.news.create')} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <Label>{t('admin.news.title')}</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <Label>{t('admin.news.cover')}</Label>
          <div className="flex items-center gap-3">
            {coverUrl && <img src={coverUrl} alt="" className="h-14 rounded-xl object-cover" />}
            <label className="text-sm text-brand-teal cursor-pointer">
              {uploading ? t('common.loading') : t('admin.news.uploadCover')}
              <input type="file" accept="image/*" hidden onChange={onCover} />
            </label>
          </div>
        </div>

        <div>
          <Label>{t('admin.news.accent')}</Label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccent(c)}
                className={cn('size-7 rounded-full', accent === c && 'ring-2 ring-white ring-offset-2 ring-offset-background')}
                style={{ background: c }}
              />
            ))}
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="size-7 rounded bg-transparent" />
          </div>
        </div>

        <div>
          <Label>{t('admin.news.body')}</Label>
          <RichTextEditor value={body} onChange={setBody} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t('admin.news.date')}</Label>
            <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
          </div>
          <label className="flex items-end gap-2 text-sm cursor-pointer pb-2">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="size-4 accent-brand-violet" />
            {t('admin.news.published')}
          </label>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button className="w-full" disabled={creating || updating || !title} onClick={save}>
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  )
}
