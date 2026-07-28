import { Link } from 'react-router-dom'
import { useGetNewsQuery } from '@/entities/news'

export function NewsSlider() {
  const { data } = useGetNewsQuery()
  if (!data || data.length === 0) return null

  return (
    <div className="-mx-1 mb-5 flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none">
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
  )
}
