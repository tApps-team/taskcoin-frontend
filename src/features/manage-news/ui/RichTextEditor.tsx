import { EditorContent, useEditor } from '@tiptap/react'
import { Bold, Heading2, Heading3, Image as ImageIcon, Italic, Link2, List, ListOrdered } from 'lucide-react'
import { useAdminUploadImageMutation } from '@/entities/application'
import type { TipTapDoc } from '@/shared/api/types'
import { tiptapExtensions } from '@/shared/lib/tiptap'
import { cn } from '@/shared/lib/utils'

function Btn({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'size-8 rounded-lg flex items-center justify-center text-sm transition-colors',
        active ? 'bg-brand-violet text-white' : 'bg-white/5 text-muted-foreground hover:bg-white/10',
      )}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: TipTapDoc
  onChange: (doc: TipTapDoc) => void
}) {
  const [uploadImage] = useAdminUploadImageMutation()
  const editor = useEditor({
    extensions: tiptapExtensions,
    content: value as object,
    onUpdate: ({ editor }) => onChange(editor.getJSON() as TipTapDoc),
  })

  if (!editor) return null

  const addImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const form = new FormData()
      form.append('file', file)
      try {
        const res = await uploadImage(form).unwrap()
        editor.chain().focus().setImage({ src: res.url }).run()
      } catch {
        /* ignore upload errors here */
      }
    }
    input.click()
  }

  const addLink = () => {
    const url = window.prompt('URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
    else editor.chain().focus().unsetLink().run()
  }

  return (
    <div className="glass-soft rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 bg-white/5">
        <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </Btn>
        <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </Btn>
        <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="size-4" />
        </Btn>
        <Btn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="size-4" />
        </Btn>
        <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="size-4" />
        </Btn>
        <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </Btn>
        <Btn active={editor.isActive('link')} onClick={addLink}>
          <Link2 className="size-4" />
        </Btn>
        <Btn onClick={addImage}>
          <ImageIcon className="size-4" />
        </Btn>
      </div>
      <EditorContent editor={editor} className="tiptap px-4 py-3 min-h-[200px] max-h-[40vh] overflow-y-auto" />
    </div>
  )
}
