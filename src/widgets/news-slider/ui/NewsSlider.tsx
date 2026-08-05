import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGetNewsQuery } from '@/entities/news'

export function NewsSlider() {
  const { data } = useGetNewsQuery()
  const scrollRef = useRef<HTMLDivElement>(null)
  if (!data || data.length === 0) return null

  const scrollBy = (dir: number) =>
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' })

  return (
    <div className="relative mb-5">
      <div
        ref={scrollRef}
        className="-mx-1 flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none"
      >
        {data.map((n) => (
          <Link
            key={n.id}
            to={`/app/news/${n.id}`}
            className="relative shrink-0 snap-start w-56 h-20 rounded-lg md:w-64 md:h-24 md:rounded-xl overflow-hidden p-3 flex items-end bg-cover bg-center transition hover:brightness-110 active:scale-[0.99]"
            style={
              n.cover_url
                ? { backgroundImage: `url(${n.cover_url})` }
                : { backgroundColor: n.accent || '#7c5cff' }
            }
          >
            <div className="relative z-10 font-bold text-white text-sm leading-tight line-clamp-2">
              {n.title}
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop-only scroll arrows */}
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="prev"
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 size-9 items-center justify-center rounded-full glass shadow-glow text-foreground hover:bg-white/10 transition-colors"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="next"
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 size-9 items-center justify-center rounded-full glass shadow-glow text-foreground hover:bg-white/10 transition-colors"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  )
}
