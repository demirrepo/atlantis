import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MediaCard from './MediaCard'
import type { MediaType, Movie, TVShow } from '@/types/tmdb'

interface MediaRowProps {
  title: string
  items: (Movie | TVShow)[]
  /** Fallback when an item has no media_type (e.g. /tv/popular results) */
  type: MediaType
  isLoading?: boolean
}

export default function MediaRow({ title, items, type, isLoading = false }: MediaRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  if (!isLoading && items.length === 0) return null

  return (
    <section className="group/row relative">
      <h2 className="mb-1 px-4 text-lg font-semibold sm:px-8 sm:text-xl lg:px-12">{title}</h2>

      <div
        ref={scrollerRef}
        className="scrollbar-hide flex snap-x gap-2 overflow-x-auto scroll-smooth px-4 py-4 sm:gap-3 sm:px-8 lg:px-12"
      >
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="aspect-[2/3] w-32 shrink-0 animate-pulse rounded-md bg-slate-800 sm:w-40 lg:w-44"
              />
            ))
          : items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                type={item.media_type ?? type}
                className="w-32 shrink-0 snap-start sm:w-40 lg:w-44"
              />
            ))}
      </div>

      {/* Desktop scroll arrows, revealed on row hover */}
      {!isLoading && (
        <>
          <ScrollButton side="left" onClick={() => scrollBy(-1)} />
          <ScrollButton side="right" onClick={() => scrollBy(1)} />
        </>
      )}
    </section>
  )
}

function ScrollButton({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Scroll left' : 'Scroll right'}
      className={`absolute top-9 bottom-4 z-20 hidden w-10 items-center justify-center bg-abyss/60 text-blue-100 opacity-0 transition group-hover/row:opacity-100 hover:bg-blue-950/80 hover:text-blue-300 md:flex lg:w-12 ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
    >
      <Icon className="size-8" />
    </button>
  )
}
