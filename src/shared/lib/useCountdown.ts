import { useEffect, useState } from 'react'

// Returns mm:ss (or hh:mm:ss) until the deadline and whether it has passed.
export function useCountdown(deadlineIso: string): { label: string; expired: boolean } {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = new Date(deadlineIso).getTime() - now
  if (diff <= 0) return { label: '00:00', expired: true }

  const totalSec = Math.floor(diff / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  const label = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
  return { label, expired: false }
}
