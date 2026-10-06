import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Loader2 } from 'lucide-react'
import MediaCard from '@/components/media/MediaCard'
import { useAuth } from '@/context/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getMovieDetails, getTvDetails } from '@/services/tmdbApi'
import { getWatchlist } from '@/services/watchlistApi'
import type { MediaType, MovieDetails, TVDetails } from '@/types/tmdb'

type SavedTitle = { type: MediaType; data: MovieDetails | TVDetails }

export default function MyList() {
  // RequireAuth guarantees a user here
  const { user } = useAuth()
  const userId = user!.id
  const [titles, setTitles] = useState<SavedTitle[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useDocumentTitle('My List')

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    getWatchlist(userId)
      .then((entries) =>
        // Fetch TMDB metadata in parallel; a title TMDB can't return is skipped, not fatal
        Promise.allSettled(
          entries.map(async ({ media_type, tmdb_id }): Promise<SavedTitle> => ({
            type: media_type,
            data:
              media_type === 'tv'
                ? await getTvDetails(tmdb_id, { signal })
                : await getMovieDetails(tmdb_id, { signal }),
          })),
        ),
      )
      .then((results) => {
        if (signal.aborted) return
        setTitles(results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : [])))
      })
      .catch((err: Error) => {
        if (!signal.aborted) setError(err.message)
      })

    return () => controller.abort()
  }, [userId])

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16 sm:px-8 lg:px-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">My List</h1>
        {titles && titles.length > 0 && (
          <p className="text-sm text-white/50">
            {titles.length} {titles.length === 1 ? 'title' : 'titles'}
          </p>
        )}
      </div>

      {error ? (
        <p className="py-20 text-center text-red-400">Couldn't load your list: {error}</p>
      ) : !titles ? (
        <div className="flex justify-center py-24">
          <Loader2 className="size-10 animate-spin text-brand" aria-label="Loading your list" />
        </div>
      ) : titles.length === 0 ? (
        <div className="mx-auto flex max-w-sm flex-col items-center py-24 text-center">
          <div className="mb-5 rounded-full bg-blue-500/10 p-5 ring-1 ring-blue-400/30">
            <Bookmark className="size-10 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold">Your list is empty</h2>
          <p className="mt-2 text-white/60">
            Tap <span className="font-semibold text-blue-300">+ My List</span> on any movie or show to save it here.
          </p>
          <Link
            to="/"
            className="mt-6 rounded-md bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition hover:bg-blue-500"
          >
            Browse titles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {titles.map(({ type, data }) => (
            <MediaCard key={`${type}-${data.id}`} item={data} type={type} className="w-full" showTypeBadge />
          ))}
        </div>
      )}
    </main>
  )
}
