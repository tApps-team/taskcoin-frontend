import { motion } from 'framer-motion'
import { useMemo } from 'react'

const COLORS = ['#7c5cff', '#2dd4bf', '#f59e0b', '#ef4444', '#22c55e', '#e879f9', '#38bdf8']

// Self-contained full-screen confetti burst (no external libs). Mount it to
// play once — the caller unmounts it after ~2.5s.
export function Confetti({ pieces = 90 }: { pieces?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }).map((_, i) => ({
        id: i,
        left: Math.random() * 100, // vw
        delay: Math.random() * 0.4,
        duration: 2 + Math.random() * 1.4,
        drift: (Math.random() - 0.5) * 160,
        spin: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 540),
        color: COLORS[i % COLORS.length],
        w: 6 + Math.random() * 7,
        h: 8 + Math.random() * 8,
      })),
    [pieces],
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {items.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: '-10vh', x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', x: p.drift, rotate: p.spin, opacity: [1, 1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            left: `${p.left}vw`,
            top: 0,
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  )
}
