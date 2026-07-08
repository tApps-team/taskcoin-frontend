import { ImagePlus, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useDeleteScreenshotMutation,
  useGetMySubmissionsQuery,
  useStartTaskMutation,
  useSubmitSubmissionMutation,
  useUploadScreenshotsMutation,
  type Submission,
} from '@/entities/submission'
import { useCountdown } from '@/shared/lib/useCountdown'
import { Button, Card, CardContent, StatusBadge } from '@/shared/ui'

const MAX = 5

function errMsg(e: unknown): string {
  const detail = (e as { data?: { detail?: string } })?.data?.detail
  return typeof detail === 'string' ? detail : 'Ошибка'
}

export function TaskWork({ taskId }: { taskId: string }) {
  const { t } = useTranslation()
  const { data: subs } = useGetMySubmissionsQuery({ limit: 100 })
  const [start, { isLoading: starting }] = useStartTaskMutation()
  const [uploadScreenshots, { isLoading: uploading }] = useUploadScreenshotsMutation()
  const [deleteScreenshot] = useDeleteScreenshotMutation()
  const [submit, { isLoading: submitting }] = useSubmitSubmissionMutation()
  const [error, setError] = useState('')

  const active = subs?.items.find(
    (s) => s.task_id === taskId && (s.status === 'in_progress' || s.status === 'submitted'),
  )

  const onStart = async () => {
    setError('')
    try {
      await start(taskId).unwrap()
    } catch (e) {
      setError(errMsg(e))
    }
  }

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!active) return
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return
    if (active.screenshots.length + files.length > MAX) {
      setError(`${t('submission.uploadTitle')} (max ${MAX})`)
      return
    }
    setError('')
    const fd = new FormData()
    files.forEach((f) => fd.append('files', f))
    try {
      await uploadScreenshots({ submissionId: active.id, files: fd }).unwrap()
    } catch (e) {
      setError(errMsg(e))
    }
  }

  const onSubmit = async () => {
    if (!active) return
    setError('')
    try {
      await submit(active.id).unwrap()
    } catch (e) {
      setError(errMsg(e))
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        {!active ? (
          <Button className="w-full" size="lg" onClick={onStart} disabled={starting}>
            {t('tasks.take')}
          </Button>
        ) : (
          <ActiveArea
            active={active}
            uploading={uploading}
            submitting={submitting}
            onUpload={onUpload}
            onDelete={(sid) => deleteScreenshot({ submissionId: active.id, screenshotId: sid })}
            onSubmit={onSubmit}
          />
        )}
        {error && <p className="text-destructive text-sm mt-3">{error}</p>}
      </CardContent>
    </Card>
  )
}

function ActiveArea({
  active,
  uploading,
  submitting,
  onUpload,
  onDelete,
  onSubmit,
}: {
  active: Submission
  uploading: boolean
  submitting: boolean
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDelete: (sid: string) => void
  onSubmit: () => void
}) {
  const { t } = useTranslation()
  const { label, expired } = useCountdown(active.deadline_at)
  const isSubmitted = active.status === 'submitted'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <StatusBadge status={active.status} />
        {!isSubmitted && (
          <div className="text-right">
            <div className="text-xs text-muted-foreground">{t('submission.timeLeft')}</div>
            <div className={`text-2xl font-mono font-bold ${expired ? 'text-destructive' : 'text-brand-teal'}`}>
              {expired ? t('submission.expired') : label}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
        {active.screenshots.map((s) => (
          <div key={s.id} className="relative">
            <img src={s.file_path} alt="" className="w-full h-24 object-cover rounded-xl border border-white/10" />
            {!isSubmitted && (
              <button
                onClick={() => onDelete(s.id)}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full size-6 flex items-center justify-center hover:bg-black"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}
        {!isSubmitted && active.screenshots.length < MAX && (
          <label className="flex items-center justify-center h-24 rounded-xl border border-dashed border-white/15 cursor-pointer text-muted-foreground hover:border-brand-violet hover:text-brand-purple transition-colors">
            <ImagePlus />
            <input type="file" accept="image/*" multiple hidden onChange={onUpload} disabled={uploading} />
          </label>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-4">{t('submission.uploadHint')}</p>

      {isSubmitted ? (
        <p className="text-brand-teal font-medium">✓ {t('submission.inReview')}</p>
      ) : (
        <Button
          variant="teal"
          className="w-full"
          onClick={onSubmit}
          disabled={submitting || active.screenshots.length < 1}
        >
          {t('submission.submit')}
        </Button>
      )}
    </div>
  )
}
