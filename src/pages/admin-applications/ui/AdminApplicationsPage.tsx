import { Plus, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAdminDeleteApplicationMutation,
  useAdminGetApplicationsQuery,
  type Application,
} from '@/entities/application'
import { ApplicationModal } from '@/features/manage-applications'
import { Button, Card, CardContent, EmptyState, Spinner } from '@/shared/ui'

export function AdminApplicationsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminGetApplicationsQuery()
  const [editing, setEditing] = useState<Application | null>(null)
  const [creating, setCreating] = useState(false)
  const [remove] = useAdminDeleteApplicationMutation()

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{t('admin.apps.title')}</h1>
        <Button onClick={() => setCreating(true)}>
          <Plus /> {t('admin.apps.create')}
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data || data.length === 0 ? (
        <EmptyState emoji="📱" text={t('admin.apps.empty')} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center gap-3">
                {a.icon_url ? (
                  <img src={a.icon_url} alt="" className="size-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Smartphone className="size-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{a.name}</div>
                  <div className="text-xs text-muted-foreground uppercase">{a.platform}</div>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(a)}>
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => confirm(t('admin.apps.confirmDelete')) && remove(a.id)}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {creating && <ApplicationModal onClose={() => setCreating(false)} />}
      {editing && <ApplicationModal application={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
