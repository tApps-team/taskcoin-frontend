import type { ReactNode } from 'react'

export interface PercentItem {
  key: string
  label: ReactNode
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

// Recompute all values so they sum to exactly 100 after `changedKey` was set to
// `newVal`: the remaining share is distributed across the OTHER items
// proportionally to their current values (largest-remainder rounding). If the
// others are all 0, the remainder is split evenly.
export function rebalance(
  values: Record<string, number>,
  keys: string[],
  changedKey: string,
  newVal: number,
): Record<string, number> {
  const v = clamp(newVal)
  const others = keys.filter((k) => k !== changedKey)
  if (others.length === 0) return { [changedKey]: 100 }

  const remaining = 100 - v
  const curSum = others.reduce((s, k) => s + (values[k] || 0), 0)
  const raw = others.map((k) =>
    curSum > 0 ? ((values[k] || 0) / curSum) * remaining : remaining / others.length,
  )
  const floors = raw.map(Math.floor)
  let leftover = remaining - floors.reduce((a, b) => a + b, 0)
  raw
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ i }) => {
      if (leftover-- > 0) floors[i] += 1
    })

  const result: Record<string, number> = { [changedKey]: v }
  others.forEach((k, i) => (result[k] = Math.max(0, floors[i])))
  return result
}

export function PercentSliders({
  items,
  values,
  onChange,
}: {
  items: PercentItem[]
  values: Record<string, number>
  onChange: (v: Record<string, number>) => void
}) {
  const keys = items.map((i) => i.key)
  const single = items.length === 1

  const set = (key: string, val: number) => {
    if (single) {
      onChange({ [key]: 100 })
      return
    }
    onChange(rebalance(values, keys, key, val))
  }

  return (
    <div className="space-y-2.5">
      {items.map((it) => {
        const val = single ? 100 : values[it.key] ?? 0
        return (
          <div key={it.key} className="flex items-center gap-3">
            <div className="w-28 shrink-0 text-sm truncate">{it.label}</div>
            <input
              type="range"
              min={0}
              max={100}
              value={val}
              disabled={single}
              onChange={(e) => set(it.key, Number(e.target.value))}
              className="flex-1 accent-brand-violet disabled:opacity-50"
            />
            <div className="w-12 shrink-0 text-right text-sm font-mono">{val}%</div>
          </div>
        )
      })}
    </div>
  )
}
