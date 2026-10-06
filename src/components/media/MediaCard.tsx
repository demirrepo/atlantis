import { Link } from 'react-router-dom'
import { getImageUrl, getTitle } from '@/services/tmdbApi'
import { detailsPath } from '@/lib/embed'
import type { MediaType, Movie, MovieDetails, TVDetails, TVShow } from '@/types/tmdb'

interface MediaCardProps {
  item: Movie | TVShow | MovieDetails | TVDetails
  type: MediaType
  /** Sizing/layout classes from the parent (fixed width in rows, full width in grids) */
  className?: string
  showTypeBadge?: boolean
}

export default function MediaCard({ item, type, className = '', showTypeBadge = false }: MediaCardProps) {
  const poster = getImageUrl(item.poster_path, 'w342')
  const title = getTitle(item)

  return (
    <Link
      to={detailsPath(type, item.id)}
      viewTransition
      title={title}
      className={`relative overflow-hidden rounded-md bg-slate-900 ring-blue-500/70 transition-[transform,box-shadow] duration-300 hover:z-10 hover:scale-105 hover:shadow-[0_0_24px_rgba(59,130,246,0.35)] hover:ring-2 focus-visible:z-10 focus-visible:scale-105 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${className}`}
    >
      {poster ? (
        <img src={poster} alt={title} loading="lazy" className="aspect-[2/3] w-full object-cover" />
      ) : (
        <div className="grid aspect-[2/3] place-items-center p-3 text-center text-sm text-white/60">
          {title}
        </div>
      )}
      {showTypeBadge && (
        <span className="absolute top-2 left-2 rounded bg-blue-950/80 px-1.5 text-blue-200 ring-1 ring-blue-400/30 py-0.5 text-[10px] font-semibold tracking-wide uppercase backdrop-blur-sm">
          {type === 'tv' ? 'Series' : 'Film'}
        </span>
      )}
    </Link>
  )
}
