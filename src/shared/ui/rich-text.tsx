import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect } from 'react'
import { tiptapExtensions } from '@/shared/lib/tiptap'
import type { TipTapDoc } from '@/shared/api/types'
import { cn } from '@/shared/lib/utils'

// Read-only renderer for a TipTap JSON document (news articles etc).
export function RichTextContent({ content, className }: { content: TipTapDoc; className?: string }) {
  const editor = useEditor({
    editable: false,
    extensions: tiptapExtensions,
    content: content as object,
  })

  useEffect(() => {
    if (editor && content) editor.commands.setContent(content as object)
  }, [editor, content])

  if (!editor) return null
  return <EditorContent editor={editor} className={cn('tiptap', className)} />
}
