import { EditorContent, useEditor } from '@tiptap/react'
import { Bold, ImageIcon, Italic, Link2, Paperclip, Send, Strikethrough, Underline, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUploadFeedbackMediaMutation } from '@/entities/feedback'
import type { TicketAttachment, TipTapDoc } from '@/shared/api/types'
import { EMPTY_DOC, tiptapExtensions } from '@/shared/lib/tiptap'
import { Button } from '@/shared/ui'

export function ChatComposer({
  onSend,
  sending,
}: {
  onSend: (body: TipTapDoc, attachments: TicketAttachment[]) => Promise<void> | void
  sending: boolean
}) {
  const { t } = useTranslation()
  const [upload, { isLoading: uploading }] = useUploadFeedbackMediaMutation()
  const [attachments, setAttachments] = useState<TicketAttachment[]>([])
  const editor = useEditor({ extensions: tiptapExtensions, content: EMPTY_DOC })

  const btn = 'p-1.5 rounded hover:bg-white/10 transition-colors'
  const active = (v: boolean) => (v ? 'text-brand-teal' : 'text-muted-foreground')

  const uploadOne = async (file: File): Promise<TicketAttachment | null> => {
    const fd = new FormData()
    fd.append('file', file)
    try {
      return await upload(fd).unwrap()
    } catch {
      return null
    }
  }

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const a = await uploadOne(file)
    if (a) editor?.chain().focus().setImage({ src: a.url }).run()
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const a = await uploadOne(file)
    if (a) setAttachments((prev) => [...prev, a])
  }

  const setLink = () => {
    const url = window.prompt(t('feedback.linkPrompt'))
    if (url === null) return
    if (url === '') editor?.chain().focus().unsetLink().run()
    else editor?.chain().focus().setLink({ href: url }).run()
  }

  const send = async () => {
    if (!editor) return
    const body = editor.getJSON() as TipTapDoc
    if (editor.isEmpty && attachments.length === 0) return
    await onSend(body, attachments)
    editor.commands.clearContent()
    setAttachments([])
  }

  return (
    <div className="glass-soft rounded-2xl p-3 space-y-2">
      <div className="flex items-center gap-1 flex-wrap">
        <button type="button" className={`${btn} ${active(!!editor?.isActive('bold'))}`} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </button>
        <button type="button" className={`${btn} ${active(!!editor?.isActive('italic'))}`} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </button>
        <button type="button" className={`${btn} ${active(!!editor?.isActive('underline'))}`} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          <Underline className="size-4" />
        </button>
        <button type="button" className={`${btn} ${active(!!editor?.isActive('strike'))}`} onClick={() => editor?.chain().focus().toggleStrike().run()}>
          <Strikethrough className="size-4" />
        </button>
        <button type="button" className={`${btn} ${active(!!editor?.isActive('link'))}`} onClick={setLink}>
          <Link2 className="size-4" />
        </button>
        <label className={`${btn} cursor-pointer text-muted-foreground`}>
          <ImageIcon className="size-4" />
          <input type="file" accept="image/*" hidden onChange={onImage} disabled={uploading} />
        </label>
        <label className={`${btn} cursor-pointer text-muted-foreground`}>
          <Paperclip className="size-4" />
          <input type="file" hidden onChange={onFile} disabled={uploading} />
        </label>
      </div>

      <EditorContent
        editor={editor}
        className="tiptap min-h-[60px] max-h-48 overflow-y-auto rounded-lg bg-white/5 px-3 py-2 text-sm"
      />

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs bg-white/10 rounded-lg px-2 py-1">
              📎 {a.name}
              <button type="button" onClick={() => setAttachments((p) => p.filter((_, idx) => idx !== i))}>
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Button variant="teal" className="w-full" disabled={sending || uploading} onClick={send}>
        <Send className="size-4" /> {t('feedback.send')}
      </Button>
    </div>
  )
}
