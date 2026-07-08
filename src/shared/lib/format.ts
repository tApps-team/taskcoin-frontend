// Currency + formatting helpers shared across the app.

const MONEY_PER_UNIT = 1000 // coin_rate is "LMN per 1000 currency units"

export function coinsToMoney(coins: number | string, coinRate: number | string): number {
  const c = Number(coins)
  const rate = Number(coinRate) || 100
  return (c / rate) * MONEY_PER_UNIT
}

export function formatCoins(value: number | string): string {
  const n = Number(value)
  return `${n.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} 🍋`
}

export function formatMoney(value: number, currency = 'RUB'): string {
  return `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ${currency}`
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

export function maskCard(card: string): string {
  const digits = card.replace(/\D/g, '')
  if (digits.length < 8) return card
  return `${digits.slice(0, 4)} •••• •••• ${digits.slice(-4)}`
}
