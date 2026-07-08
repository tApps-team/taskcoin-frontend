import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect } from 'react'
import type { TipTapDoc } from '@/shared/api/types'
import { tiptapExtensions } from './tiptap/extensions'

// Read-only renderer for task content stored as a TipTap JSON document.
export function TaskContent({ content }: { content: TipTapDoc }) {
  const editor = useEditor({
    editable: false,
    extensions: tiptapExtensions,
    content: content && Object.keys(content).length ? content : { type: 'doc', content: [] },
  })

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content as never)
    }
  }, [editor, content])

  if (!editor) return null
  return <EditorContent editor={editor} className="tiptap" />
}
