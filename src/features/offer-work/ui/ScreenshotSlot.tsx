import { Loader2, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useDeleteScreenshotMutation,
  useUploadScreenshotsMutation,
  type Execution,
} from '@/entities/execution'
import type { ScreenshotKind } from '@/shared/api/types'
import { getErrorMessage } from '@/shared/lib/errors'

// A single-file upload slot for one screenshot purpose (main/review/rating).
// The backend keeps exactly one screenshot per kind (re-upload replaces it).
export function ScreenshotSlot({
  execution,
  kind,
  placeholder,
}: {
  execution: Execution
  kind: ScreenshotKind
  placeholder: string
}) {
  const { t } = useTranslation()
  const [upload, { isLoading: uploading }] = useUploadScreenshotsMutation()
  const [removeShot] = useDeleteScreenshotMutation()
  const [error, setError] = useState('')

  const shot = execution.screenshots.find((s) => s.kind === kind)

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('files', file)
    form.append('kind', kind)
    try {
      await upload({ executionId: execution.id, files: form }).unwrap()
    } catch (err) {
      setError(getErrorMessage(err, t('common.error')))
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-2">
      {shot ? (
        <div className="relative inline-block">
          <img
            src={shot.file_path}
            alt=""
            className="w-24 h-24 object-cover rounded-xl border border-white/10"
          />
          <button
            type="button"
            onClick={() => removeShot({ executionId: execution.id, screenshotId: shot.id })}
            className="absolute -top-2 -right-2 bg-destructive rounded-full p-1 text-white"
            aria-label={t('common.delete')}
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      ) : uploading ? (
        <div className="flex items-center justify-center gap-3 border border-dashed border-white/20 rounded-xl px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 shrink-0 animate-spin" /> {t('offer.uploading')}
        </div>
      ) : (
        <label className="flex items-center justify-center gap-3 border border-dashed border-white/20 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors">
          <Upload className="size-4 shrink-0" />
          <span className="text-sm">{placeholder}</span>
          <input type="file" accept="image/*" hidden onChange={onUpload} disabled={uploading} />
        </label>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}
