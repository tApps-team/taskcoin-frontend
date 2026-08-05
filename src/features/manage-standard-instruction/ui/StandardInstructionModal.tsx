import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminUploadImageMutation } from '@/entities/application'
import {
  useGetStandardInstructionQuery,
  useUpdateStandardInstructionMutation,
} from '@/entities/standard-instruction'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button, Label, Modal, Spinner, Textarea } from '@/shared/ui'

export function StandardInstructionModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const { data, isLoading } = useGetStandardInstructionQuery()
  const [uploadImage, { isLoading: uploading }] = useAdminUploadImageMutation()
  const [update, { isLoading: saving }] = useUpdateStandardInstructionMutation()

  const [media, setMedia] = useState<string | null | undefined>(undefined)
  const [text, setText] = useState<string | undefined>(undefined)
  const [error, setError] = useState('')

  // Fall back to fetched values until the admin edits a field.
  const mediaVal = media !== undefined ? media : data?.media_url ?? null
  const textVal = text !== undefined ? text : data?.text ?? ''

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await uploadImage(form).unwrap()
      setMedia(res.url)
    } catch (err) {
      setError(getErrorMessage(err, t('common.error')))
    }
    e.target.value = ''
  }

  const save = async () => {
    setError('')
    try {
      await update({ media_url: mediaVal, text: textVal || null }).unwrap()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, t('common.error')))
    }
  }

  return (
    <Modal title={t('admin.standardInstruction.title')} onClose={onClose}>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{t('admin.standardInstruction.hint')}</p>
          <div>
            <Label>{t('admin.standardInstruction.image')}</Label>
            <div className="flex items-center gap-3">
              {mediaVal && <img src={mediaVal} alt="" className="size-16 rounded-xl object-cover" />}
              <label className="text-sm text-brand-teal cursor-pointer">
                {uploading ? t('common.loading') : t('admin.campaigns.instructionImage')}
                <input type="file" accept="image/*" hidden onChange={onImage} />
              </label>
              {mediaVal && (
                <button type="button" className="text-xs text-destructive" onClick={() => setMedia(null)}>
                  {t('common.delete')}
                </button>
              )}
            </div>
          </div>
          <div>
            <Label>{t('admin.standardInstruction.text')}</Label>
            <Textarea value={textVal} onChange={(e) => setText(e.target.value)} />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button className="w-full" disabled={saving} onClick={save}>
            {t('common.save')}
          </Button>
        </div>
      )}
    </Modal>
  )
}
