import { formatAmount } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

// Renders a ruble amount ("1 234 ₽"). Kept named CoinAmount for import stability.
export function CoinAmount({
  value,
  className,
}: {
  value: number | string
  className?: string
  iconClassName?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-0.5 whitespace-nowrap', className)}>
      {formatAmount(value)}&nbsp;₽
    </span>
  )
}
