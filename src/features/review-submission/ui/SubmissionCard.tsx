import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAdminApproveMutation,
  useAdminRejectMutation,
  type AdminSubmission,
} from '@/entities/submission'
import { formatCoins, formatDate } from '@/shared/lib/format'
import { Button, Card, CardContent, Modal, StatusBadge, Textarea } from '@/shared/ui'

export function SubmissionCard({ submission }: { submission: AdminSubmission }) {
  const { t } = useTranslation()
  const [approve, { isLoading: approving }] = useAdminApproveMutation()
  const [reject, { isLoading: rejecting }] = useAdminRejectMutation()
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [comment, setComment] = useState('')

  const s = submission
  const canReview = s.status === 'submitted'

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="font-semibold text-foreground">{s.task.title}</div>
            <div className="text-sm text-muted-foreground">
              {s.user.email} · {formatCoins(s.reward_snapshot)}
            </div>
          </div>
          <StatusBadge status={s.status} />
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          {t('common.date')}: {formatDate(s.submitted_at || s.started_at)}
        </div>

        {s.screenshots.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {s.screenshots.map((sc) => (
              <img
                key={sc.id}
                src={sc.file_path}
                alt=""
                onClick={() => setLightbox(sc.file_path)}
                className="w-20 h-20 object-cover rounded-xl border border-white/10 cursor-pointer hover:border-brand-violet transition-colors"
              />
            ))}
          </div>
        )}

        {s.status === 'rejected' && s.reviewer_comment && (
          <div className="text-sm text-red-300 bg-destructive/10 rounded-xl px-3 py-2 mb-2">
            {s.reviewer_comment}
          </div>
        )}

        {canReview && (
          <div className="flex gap-2">
            <Button variant="teal" className="flex-1" disabled={approving} onClick={() => approve(s.id)}>
              <Check /> {t('admin.submissions.approve')}
            </Button>
            <Button variant="destructive" className="flex-1" disabled={rejecting} onClick={() => setRejectOpen(true)}>
              <X /> {t('admin.submissions.reject')}
            </Button>
          </div>
        )}

        {lightbox && (
          <Modal title="" onClose={() => setLightbox(null)}>
            <img src={lightbox} alt="" className="w-full rounded-xl" />
          </Modal>
        )}

        {rejectOpen && (
          <Modal title={t('admin.submissions.rejectReason')} onClose={() => setRejectOpen(false)}>
            <Textarea className="min-h-[100px] mb-3" value={comment} onChange={(e) => setComment(e.target.value)} />
            <Button
              variant="destructive"
              className="w-full"
              disabled={rejecting || !comment}
              onClick={async () => {
                await reject({ id: s.id, comment })
                setRejectOpen(false)
                setComment('')
              }}
            >
              {t('admin.submissions.reject')}
            </Button>
          </Modal>
        )}
      </CardContent>
    </Card>
  )
}
