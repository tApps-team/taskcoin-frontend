import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAdminCreateApplicationMutation,
  useAdminUpdateApplicationMutation,
  useAdminUploadImageMutation,
  type Application,
} from '@/entities/application'
import { Button, Input, Label, Modal, SimpleSelect, Textarea } from '@/shared/ui'

export function ApplicationModal({
  application,
  onClose,
}: {
  application?: Application | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [create, { isLoading: creating }] = useAdminCreateApplicationMutation()
  const [update, { isLoading: updating }] = useAdminUpdateApplicationMutation()
  const [uploadImage, { isLoading: uploading }] = useAdminUploadImageMutation()

  const [name, setName] = useState(application?.name || '')
  const [platform, setPlatform] = useState(application?.platform || 'android')
  const [storeUrl, setStoreUrl] = useState(application?.store_url || '')
  const [iconUrl, setIconUrl] = useState<string | null>(application?.icon_url || null)
  const [notes, setNotes] = useState(application?.notes || '')
  const [error, setError] = useState('')

  const onIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await uploadImage(form).unwrap()
      setIconUrl(res.url)
    } catch {
      setError(t('common.error'))
    }
    e.target.value = ''
  }

  const save = async () => {
    setError('')
    const body = {
      name,
      platform,
      store_url: storeUrl,
      icon_url: iconUrl,
      notes: notes || null,
    }
    try {
      if (application) await update({ id: application.id, body }).unwrap()
      else await create(body).unwrap()
      onClose()
    } catch (err) {
      setError((err as { data?: { detail?: string } })?.data?.detail || t('common.error'))
    }
  }

  return (
    <Modal title={application ? t('admin.apps.edit') : t('admin.apps.create')} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <Label>{t('admin.apps.name')}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>{t('admin.apps.platform')}</Label>
          <SimpleSelect
            className="w-full"
            value={platform}
            onValueChange={(v) => setPlatform(v as 'ios' | 'android')}
            options={[
              { value: 'android', label: 'Android' },
              { value: 'ios', label: 'iOS' },
            ]}
          />
        </div>
        <div>
          <Label>{t('admin.apps.storeUrl')}</Label>
          <Input value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <Label>{t('admin.apps.icon')}</Label>
          <div className="flex items-center gap-3">
            {iconUrl && <img src={iconUrl} alt="" className="size-12 rounded-xl object-cover" />}
            <label className="text-sm text-brand-teal cursor-pointer">
              {uploading ? t('common.loading') : t('admin.apps.uploadIcon')}
              <input type="file" accept="image/*" hidden onChange={onIcon} />
            </label>
          </div>
        </div>
        <div>
          <Label>{t('admin.apps.notes')}</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button className="w-full" disabled={creating || updating || !name || !storeUrl} onClick={save}>
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  )
}
