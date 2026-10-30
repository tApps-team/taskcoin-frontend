import type { Store } from '@/shared/api/types'
import { storeName } from '@/shared/lib/store'

// Which store an app comes from, in one place. The OS used to be printed here
// instead ("ANDROID"), which told an advertiser nothing: two very different
// stores share that word. Today this renders a coloured dot plus the store's
// name; when brand marks are available, only this file changes.
const DOT: Record<Store, string> = {
  appstore: 'bg-sky-400',
  playmarket: 'bg-emerald-400',
  rustore: 'bg-blue-500',
}

export function StoreBadge({ store, className = '' }: { store: Store; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
      <span className={`size-1.5 rounded-full ${DOT[store]}`} />
      {storeName(store)}
    </span>
  )
}
