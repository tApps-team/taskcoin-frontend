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
          className="relative shrink-0 snap-start w-64 h-32 rounded-3xl overflow-hidden p-4 flex items-end"
          style={{ background: n.accent || '#7c5cff' }}
        >
          {n.cover_url && (
            <img
              src={n.cover_url}
              alt=""
              className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-95 pointer-events-none"
              style={{ maskImage: 'linear-gradient(to left, #000 60%, transparent)' }}
            />
          )}
          <div className="relative z-10 font-bold text-white text-lg leading-tight drop-shadow line-clamp-3 pr-2">
            {n.title}
          </div>
        </Link>
      ))}
    </div>
  )
}
