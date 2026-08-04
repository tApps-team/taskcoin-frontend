import { Download, Loader2, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAdminCreateApplicationMutation,
  useAdminFetchStoreMetaMutation,
  useAdminUpdateApplicationMutation,
  type Application,
} from '@/entities/application'
import { getErrorMessage } from '@/shared/lib/errors'
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
  const [fetchMeta, { isLoading: fetching }] = useAdminFetchStoreMetaMutation()

  const [name, setName] = useState(application?.name || '')
  const [platform, setPlatform] = useState(application?.platform || 'android')
  const [storeUrl, setStoreUrl] = useState(application?.store_url || '')
  const [iconUrl, setIconUrl] = useState<string | null>(application?.icon_url || null)
  const [notes, setNotes] = useState(application?.notes || '')
  const [error, setError] = useState('')
  const [metaMsg, setMetaMsg] = useState('')

  const pullMeta = async () => {
    setError('')
    setMetaMsg('')
    const url = storeUrl.trim()
    if (!url) return
    try {
      const meta = await fetchMeta({ store_url: url }).unwrap()
      if (meta.icon_url) setIconUrl(meta.icon_url)
      if (meta.name) setName(meta.name)
      if (!meta.icon_url && !meta.name) setMetaMsg(t('admin.apps.metaFail'))
    } catch (err) {
      setMetaMsg(getErrorMessage(err, t('admin.apps.metaFail')))
    }
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
      setError(getErrorMessage(err, t('common.error')))
    }
  }

  return (
    <Modal title={application ? t('admin.apps.edit') : t('admin.apps.create')} onClose={onClose}>
      <div className="space-y-3">
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
          <div className="flex gap-2">
            <Input
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              onBlur={pullMeta}
              placeholder="https://apps.apple.com/... | https://play.google.com/..."
            />
            <Button type="button" variant="secondary" disabled={fetching || !storeUrl.trim()} onClick={pullMeta}>
              {fetching ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {t('admin.apps.pullMeta')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t('admin.apps.storeUrlHint')}</p>
          {metaMsg && <p className="text-xs text-amber-400 mt-1">{metaMsg}</p>}
        </div>
        <div>
          <Label>{t('admin.apps.name')}</Label>
          <div className="flex items-center gap-3">
            {iconUrl ? (
              <img src={iconUrl} alt="" className="size-12 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Smartphone className="size-6 text-muted-foreground" />
              </div>
            )}
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('admin.apps.name')} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t('admin.apps.iconAuto')}</p>
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
