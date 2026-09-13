import { useTranslation } from 'react-i18next'
import type { TicketMessage } from '@/shared/api/types'
import { formatDate } from '@/shared/lib/format'
import { RichTextContent } from '@/shared/ui/rich-text'

// A single chat bubble. `mine` decides side/color: on the user page the user's
// own messages are "mine"; in the CRM the admin's messages are "mine".
export function MessageBubble({ message, mine }: { message: TicketMessage; mine: boolean }) {
  const { t } = useTranslation()
  const isAdmin = message.sender === 'admin'
  const images = message.attachments.filter((a) => a.kind === 'image')
  const files = message.attachments.filter((a) => a.kind === 'file')
  const hasBody = !!(message.body as { content?: unknown[] })?.content?.length
  const author = isAdmin ? message.admin_name || t('feedback.support') : t('feedback.you')

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${mine ? 'bg-brand-violet/20' : 'bg-white/8'}`}>
        <div className="text-[11px] text-muted-foreground mb-1">
          {author} · {formatDate(message.created_at)}
        </div>
        {hasBody && <RichTextContent content={message.body} className="text-sm" />}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noreferrer">
                <img src={a.url} alt="" className="w-28 h-28 object-cover rounded-lg border border-white/10" />
              </a>
            ))}
          </div>
        )}
        {files.map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noreferrer" className="block text-sm text-brand-teal mt-1 underline">
            📎 {a.name}
          </a>
        ))}
      </div>
    </div>
  )
}
