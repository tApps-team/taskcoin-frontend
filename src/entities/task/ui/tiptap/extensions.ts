import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import { ButtonNode } from './ButtonNode'

// Shared extension set for both the read-only renderer and the admin editor.
export const tiptapExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
  }),
  Link.configure({
    openOnClick: true,
    autolink: false,
    protocols: ['http', 'https'],
    HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer nofollow' },
  }),
  Image.configure({ inline: false, allowBase64: false }),
  ButtonNode,
]
