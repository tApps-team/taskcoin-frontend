import { Send, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useDeleteScreenshotMutation,
  useSubmitExecutionMutation,
  useUploadScreenshotsMutation,
  type Execution,
} from '@/entities/execution'
import { getErrorMessage } from '@/shared/lib/errors'
import { useCountdown } from '@/shared/lib/useCountdown'
import { Button } from '@/shared/ui'

const MAX_SCREENSHOTS = 5

export function OfferWork({ execution }: { execution: Execution }) {
  const { t } = useTranslation()
  const { label, expired } = useCountdown(execution.deadline_at)
  const [upload, { isLoading: uploading }] = useUploadScreenshotsMutation()
  const [removeShot] = useDeleteScreenshotMutation()
  const [submit, { isLoading: submitting }] = useSubmitExecutionMutation()
  const [error, setError] = useState('')

  const shots = execution.screenshots
  const canAddMore = shots.length < MAX_SCREENSHOTS

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const files = e.target.files
    if (!files || files.length === 0) return
    const form = new FormData()
    Array.from(files)
      .slice(0, MAX_SCREENSHOTS - shots.length)
      .forEach((f) => form.append('files', f))
    try {
      await upload({ executionId: execution.id, files: form }).unwrap()
    } catch (err) {
      setError(getErrorMessage(err, t('common.error')))
    }
    e.target.value = ''
  }

  const onSubmit = async () => {
    setError('')
    try {
      await submit(execution.id).unwrap()
    } catch (err) {
      setError(getErrorMessage(err, t('common.error')))
    }
  }

  return (
    <div className="glass-soft rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t('offer.timeLeft')}</span>
        <span className={expired ? 'text-destructive font-mono' : 'text-brand-teal font-mono font-bold'}>
          {label}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">{t('offer.uploadHint')}</p>

      {shots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {shots.map((s) => (
            <div key={s.id} className="relative">
              <img
                src={s.file_path}
                alt=""
                className="w-20 h-20 object-cover rounded-xl border border-white/10"
              />
              <button
                onClick={() => removeShot({ executionId: execution.id, screenshotId: s.id })}
                className="absolute -top-2 -right-2 bg-destructive rounded-full p-1 text-white"
                aria-label={t('common.delete')}
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-xl py-3 cursor-pointer hover:bg-white/5 transition-colors">
          <Upload className="size-4" />
          <span className="text-sm">{t('offer.addScreenshot')}</span>
          <input type="file" accept="image/*" multiple hidden onChange={onUpload} disabled={uploading} />
        </label>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        variant="teal"
        className="w-full"
        disabled={submitting || shots.length === 0 || expired}
        onClick={onSubmit}
      >
        <Send /> {t('offer.submit')}
      </Button>
    </div>
  )
}
