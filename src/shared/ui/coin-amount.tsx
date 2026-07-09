import { Coins } from 'lucide-react'
import { formatCoins } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

// Renders a coin amount with the lucide "Coins" icon. The icon scales with the
// surrounding font size, so it looks right in headers, cards and table cells.
export function CoinAmount({
  value,
  className,
  iconClassName,
}: {
  value: number | string
  className?: string
  iconClassName?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap', className)}>
      <Coins className={cn('size-[1.05em] shrink-0 opacity-90', iconClassName)} />
      {formatCoins(value)}
    </span>
  )
}
