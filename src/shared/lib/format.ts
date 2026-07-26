// Formatting helpers shared across the app. Balance and prices are in rubles.

export function formatAmount(value: number | string): string {
  const n = Number(value)
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 2 })
}

export function formatMoney(value: number | string, currency = '₽'): string {
  return `${formatAmount(value)} ${currency}`
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
