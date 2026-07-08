import { Node, mergeAttributes } from '@tiptap/core'

function safeUrl(url: unknown): string {
  const s = String(url ?? '')
  return /^https?:\/\//i.test(s) ? s : '#'
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    button: {
      setButton: (attrs: { label: string; url: string }) => ReturnType
    }
  }
}

// Custom TipTap block node rendered as a prominent link-button.
export const ButtonNode = Node.create({
  name: 'button',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      label: { default: 'Открыть' },
      url: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'a[data-button]' }]
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        'data-button': '',
        href: safeUrl(node.attrs.url),
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
        class: 'tt-button',
      }),
      node.attrs.label || 'Открыть',
    ]
  },

  addCommands() {
    return {
      setButton:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },
})
