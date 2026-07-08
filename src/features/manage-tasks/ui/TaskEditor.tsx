import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import {
  Bold,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  MousePointerClick,
  Unlink,
} from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { tiptapExtensions, type TipTapDoc } from '@/entities/task'
import { Toggle } from '@/shared/ui'
import { useUploadImageMutation } from '../api'

function Toolbar({ editor }: { editor: Editor }) {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadImage] = useUploadImageMutation()

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await uploadImage(fd).unwrap()
      editor.chain().focus().setImage({ src: res.url }).run()
    } catch {
      /* ignore upload errors in UI */
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const addLink = () => {
    const url = window.prompt(t('admin.editor.linkPrompt')) || ''
    if (/^https?:\/\//i.test(url)) editor.chain().focus().setLink({ href: url }).run()
  }

  const addButton = () => {
    const label = window.prompt(t('admin.editor.buttonLabel')) || ''
    if (!label) return
    const url = window.prompt(t('admin.editor.buttonUrl')) || ''
    if (!/^https?:\/\//i.test(url)) return
    editor.chain().focus().setButton({ label, url }).run()
  }

  return (
    <div className="flex flex-wrap gap-1 border-b border-white/10 p-2">
      <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
        <Bold />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
        <Italic />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
        <List />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('link')} onPressedChange={addLink}>
        <LinkIcon />
      </Toggle>
      <Toggle size="sm" pressed={false} onPressedChange={() => editor.chain().focus().unsetLink().run()}>
        <Unlink />
      </Toggle>
      <Toggle size="sm" pressed={false} onPressedChange={() => fileRef.current?.click()}>
        <ImageIcon />
      </Toggle>
      <Toggle size="sm" pressed={false} onPressedChange={addButton}>
        <MousePointerClick />
      </Toggle>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
    </div>
  )
}

export function TaskEditor({
  value,
  onChange,
}: {
  value: TipTapDoc
  onChange: (doc: TipTapDoc) => void
}) {
  const editor = useEditor({
    extensions: tiptapExtensions,
    content: value && Object.keys(value).length ? value : { type: 'doc', content: [] },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as TipTapDoc),
  })

  if (!editor) return null

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="tiptap min-h-[220px] p-3" />
    </div>
  )
}
