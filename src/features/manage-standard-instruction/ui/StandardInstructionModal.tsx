import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminUploadImageMutation } from '@/entities/application'
import {
  useGetStandardInstructionQuery,
  useUpdateStandardInstructionMutation,
  type StandardInstruction,
  type StandardInstructionKey,
  type StandardInstructions,
} from '@/entities/standard-instruction'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button, Modal, Spinner, Textarea } from '@/shared/ui'

const SLOTS: StandardInstructionKey[] = [
  'main',
  'review_ios',
  'review_android',
  'rating_ios',
  'rating_android',
]

export function StandardInstructionModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const { data, isLoading } = useGetStandardInstructionQuery()
  const [uploadImage, { isLoading: uploading }] = useAdminUploadImageMutation()
  const [update, { isLoading: saving }] = useUpdateStandardInstructionMutation()

  const [draft, setDraft] = useState<StandardInstructions | null>(null)
  const [error, setError] = useState('')

  // Seed the working copy once the five instructions load.
  useEffect(() => {
    if (data && !draft) setDraft(data)
  }, [data, draft])

  const setField = (key: StandardInstructionKey, patch: Partial<StandardInstruction>) =>
    setDraft((d) => (d ? { ...d, [key]: { ...d[key], ...patch } } : d))

  const onImage = async (key: StandardInstructionKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await uploadImage(form).unwrap()
      setField(key, { media_url: res.url })
    } catch (err) {
      setError(getErrorMessage(err, t('common.error')))
    }
    e.target.value = ''
  }

  const save = async () => {
    if (!draft) return
    setError('')
    try {
      await update(draft).unwrap()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, t('common.error')))
    }
  }

  return (
    <Modal title={t('admin.standardInstruction.title')} onClose={onClose}>
      {isLoading || !draft ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">{t('admin.standardInstruction.hint')}</p>
          {SLOTS.map((key) => {
            const item = draft[key]
            return (
              <div key={key} className="space-y-2 border-t border-white/10 pt-3">
                <div className="font-semibold text-sm">{t(`admin.standardInstruction.slots.${key}`)}</div>
                <div className="flex items-center gap-3">
                  {item.media_url && (
                    <img src={item.media_url} alt="" className="size-16 rounded-xl object-cover" />
                  )}
                  <label className="text-sm text-brand-teal cursor-pointer">
                    {uploading ? t('common.loading') : t('admin.campaigns.instructionImage')}
                    <input type="file" accept="image/*" hidden onChange={(e) => onImage(key, e)} />
                  </label>
                  {item.media_url && (
                    <button
                      type="button"
                      className="text-xs text-destructive"
                      onClick={() => setField(key, { media_url: null })}
                    >
                      {t('common.delete')}
                    </button>
                  )}
                </div>
                <Textarea
                  value={item.text ?? ''}
                  onChange={(e) => setField(key, { text: e.target.value })}
                  placeholder={t('admin.standardInstruction.text')}
                />
              </div>
            )
          })}
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button className="w-full" disabled={saving} onClick={save}>
            {t('common.save')}
          </Button>
        </div>
      )}
    </Modal>
  )
}
