import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminGetGiftCodesQuery } from '@/entities/giftcode'
import type { Denomination } from '@/shared/api/types'
import { formatDate } from '@/shared/lib/format'
import { Button, EmptyState, Modal, Spinner } from '@/shared/ui'

const FILTERS = ['available', 'issued', ''] as const

// The denomination card only shows how many codes are left. Admins also need to
// see the cards themselves — which ones are still in stock, and who got the rest.
export function GiftCodesModal({ denom, onClose }: { denom: Denomination; onClose: () => void }) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<string>('available')
  const { data, isLoading } = useAdminGetGiftCodesQuery({
    denomination_id: denom.id,
    status: status || undefined,
    limit: 200,
  })

  return (
    <Modal title={`${t('admin.gift.codesTitle')} · ${denom.label}`} onClose={onClose}>
      <div className="flex gap-2 mb-3 flex-wrap">
        {FILTERS.map((f) => (
          <Button
            key={f || 'all'}
            size="sm"
            variant={status === f ? 'default' : 'secondary'}
            onClick={() => setStatus(f)}
          >
            {f ? t(`admin.gift.status.${f}`) : t('admin.gift.status.all')}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState emoji="🎁" text={t('admin.gift.codesEmpty')} />
      ) : (
        <div className="space-y-2 max-h-[55vh] overflow-y-auto">
          {data.items.map((c) => (
            <div key={c.id} className="rounded-xl bg-white/5 px-3 py-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* select-all so a click grabs the whole card number / code */}
                <div className="font-mono text-sm select-all break-all">
                  {c.card_number} <span className="text-muted-foreground">·</span> {c.card_code}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    c.status === 'available'
                      ? 'bg-brand-teal/15 text-brand-teal'
                      : 'bg-white/10 text-muted-foreground'
                  }`}
                >
                  {t(`admin.gift.status.${c.status}`)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {c.status === 'issued' && c.user
                  ? `${c.user.email} · ${c.issued_at ? formatDate(c.issued_at) : ''}`
                  : `${t('admin.gift.addedAt')}: ${formatDate(c.created_at)}`}
              </div>
            </div>
          ))}
          {data.total > data.items.length && (
            <div className="text-xs text-muted-foreground pt-1">
              {t('admin.gift.codesTruncated', { shown: data.items.length, total: data.total })}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
