import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'

// Shared TipTap extension set used by the news editor (admin) and the read-only
// renderer (client). Body is stored as a TipTap JSON document.
export const tiptapExtensions = [
  StarterKit.configure({ heading: { levels: [2, 3] } }),
  Image.configure({ inline: false }),
  Link.configure({ openOnClick: true, autolink: true, HTMLAttributes: { rel: 'noreferrer', target: '_blank' } }),
]

export const EMPTY_DOC = { type: 'doc', content: [] }
