import { useEffect, useState } from 'react'
import HeroBanner from '@/components/media/HeroBanner'
import MediaRow from '@/components/media/MediaRow'
import { getPopularTVShows, getTrendingMovies } from '@/services/tmdbApi'
import type { MediaType, Movie, PaginatedResponse, TVShow } from '@/types/tmdb'

interface RowConfig {
  title: string
  type: MediaType
  fetcher: (signal: AbortSignal) => Promise<PaginatedResponse<Movie | TVShow>>
}

const ROWS: RowConfig[] = [
  { title: 'Trending Now', type: 'movie', fetcher: (signal) => getTrendingMovies('week', { signal }) },
  { title: 'Popular TV Shows', type: 'tv', fetcher: (signal) => getPopularTVShows({ signal }) },
]

export default function Home() {
  return (
    <main className="pb-16">
      <HeroBanner />
      {/* Pull the rows up over the hero's bottom fade */}
      <div className="relative z-10 -mt-16 space-y-6 sm:-mt-24 lg:-mt-32">
        {ROWS.map((row) => (
          <FetchedRow key={row.title} {...row} />
        ))}
      </div>
    </main>
  )
}

// Each row loads independently, so one failing request doesn't blank the page.
function FetchedRow({ title, type, fetcher }: RowConfig) {
  const [items, setItems] = useState<(Movie | TVShow)[] | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetcher(controller.signal)
      .then((res) => setItems(res.results))
      .catch(() => {
        if (!controller.signal.aborted) setItems([])
      })
    return () => controller.abort()
  }, [fetcher])

  return <MediaRow title={title} type={type} items={items ?? []} isLoading={items === null} />
}
