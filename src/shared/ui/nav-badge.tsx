// Small red unread-count bubble, positioned over a nav icon (parent must be
// `relative`). Renders nothing when count is 0/undefined.
export function NavBadge({ count }: { count?: number }) {
  if (!count) return null
  return (
    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-white text-[10px] font-bold leading-none flex items-center justify-center shadow">
      {count > 9 ? '9+' : count}
    </span>
  )
}

// Inline red unread-count pill (e.g. in a list-row / on a button).
export function UnreadPill({ count, className = '' }: { count?: number; className?: string }) {
  if (!count) return null
  return (
    <span
      className={`shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-destructive text-white text-xs font-bold flex items-center justify-center ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
