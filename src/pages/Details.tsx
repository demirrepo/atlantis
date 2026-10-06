import { useEffect, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { Loader2, Play, Star } from 'lucide-react'
import EpisodeSelector from '@/components/media/EpisodeSelector'
import MediaRow from '@/components/media/MediaRow'
import WatchlistButton from '@/components/media/WatchlistButton'
import { getImageUrl, getMovieDetails, getRecommendations, getTvDetails } from '@/services/tmdbApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { isMediaType, watchPath } from '@/lib/embed'
import type { MediaType, Movie, MovieDetails, TVDetails, TVShow } from '@/types/tmdb'

type DetailsData = { type: 'movie'; data: MovieDetails } | { type: 'tv'; data: TVDetails }

export default function Details() {
  const { type, tmdbId } = useParams<{ type: string; tmdbId: string }>()

  if (!isMediaType(type) || !tmdbId || !/^\d+$/.test(tmdbId)) {
    return <Navigate to="/404" replace />
  }

  // Remount on navigation between titles so no state leaks from the previous one
  return <DetailsView key={`${type}-${tmdbId}`} type={type} id={Number(tmdbId)} />
}

function DetailsView({ type, id }: { type: MediaType; id: number }) {
  const [details, setDetails] = useState<DetailsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  useDocumentTitle(details ? (details.type === 'movie' ? details.data.title : details.data.name) : undefined)

  useEffect(() => {
    const controller = new AbortController()
    const request =
      type === 'movie'
        ? getMovieDetails(id, { signal: controller.signal }).then((data) => ({ type, data }) as const)
        : getTvDetails(id, { signal: controller.signal }).then((data) => ({ type, data }) as const)
    request.then(setDetails).catch((err: Error) => {
      if (!controller.signal.aborted) setError(err.message)
    })
    return () => controller.abort()
  }, [type, id])

  if (error) {
    return (
      <main className="grid min-h-dvh place-items-center px-4 text-center">
        <div>
          <p className="text-lg text-white/80">Couldn't load this title.</p>
          <p className="mt-1 text-sm text-white/50">{error}</p>
          <Link to="/" className="mt-6 inline-block rounded-md bg-white px-4 py-2 font-medium text-black">
            Back home
          </Link>
        </div>
      </main>
    )
  }

  if (!details) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <Loader2 className="size-10 animate-spin text-brand" aria-label="Loading" />
      </main>
    )
  }

  const { data } = details
  const isTv = details.type === 'tv'
  const title = details.type === 'movie' ? details.data.title : details.data.name

  // Seasons: regular seasons first (Specials, season 0, at the end), skipping empty ones
  const seasons = isTv
    ? [...details.data.seasons]
        .filter((s) => s.episode_count > 0)
        .sort((a, b) => (a.season_number || Infinity) - (b.season_number || Infinity))
    : []
  const firstSeason = seasons[0]?.season_number ?? 1
  const seasonParam = Number(searchParams.get('season'))
  const selectedSeason = seasons.some((s) => s.season_number === seasonParam) ? seasonParam : firstSeason

  const playHref = isTv ? watchPath('tv', id, firstSeason, 1) : watchPath('movie', id)

  const year = (details.type === 'movie' ? details.data.release_date : details.data.first_air_date)?.slice(0, 4)
  const lengthLabel =
    details.type === 'movie'
      ? details.data.runtime
        ? `${Math.floor(details.data.runtime / 60)}h ${details.data.runtime % 60}m`
        : null
      : `${details.data.number_of_seasons} ${details.data.number_of_seasons === 1 ? 'Season' : 'Seasons'}`

  const backdrop = getImageUrl(data.backdrop_path, 'original')
  const poster = getImageUrl(data.poster_path, 'w500')
  const logo = data.images?.logos.find((l) => l.iso_639_1 === 'en') ?? data.images?.logos[0]

  return (
    <main>
      <section className="relative flex min-h-dvh items-end overflow-hidden">
        {backdrop && (
          <img
            src={backdrop}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover object-top"
          />
        )}
        {/* Same vignette stack as HeroBanner, a touch heavier for long-form text */}
        <div className="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/70 to-blue-950/20" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-abyss via-abyss/70 to-transparent" />
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(2,6,23,0.85)]" />

        <div className="relative flex w-full flex-col gap-8 px-4 pt-28 pb-14 sm:px-8 md:flex-row md:items-end lg:gap-12 lg:px-12">
          {poster && (
            <img
              src={poster}
              alt={`${title} poster`}
              className="hidden w-56 shrink-0 rounded-lg shadow-2xl shadow-blue-950/60 ring-1 ring-blue-400/20 md:block lg:w-72"
            />
          )}

          <div className="max-w-3xl space-y-5">
            <h1 className="text-4xl font-black tracking-tight drop-shadow-lg sm:text-6xl">
              {logo ? (
                <img
                  src={getImageUrl(logo.file_path, 'w500')!}
                  alt={title}
                  className="max-h-28 w-auto max-w-[85%] object-contain object-left drop-shadow-2xl sm:max-h-36"
                />
              ) : (
                title
              )}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80 sm:text-base">
              {data.vote_count > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-white">{data.vote_average.toFixed(1)}</span>
                  <span className="text-white/50">/ 10</span>
                </span>
              )}
              {year && <span>{year}</span>}
              {lengthLabel && <span>{lengthLabel}</span>}
              {isTv && (
                <span className="rounded border border-blue-400/50 px-1.5 text-xs text-blue-300 uppercase">Series</span>
              )}
            </div>

            {data.genres.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {data.genres.map((g) => (
                  <li key={g.id} className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-100 backdrop-blur-sm">
                    {g.name}
                  </li>
                ))}
              </ul>
            )}

            {data.tagline && <p className="text-lg text-white/60 italic">{data.tagline}</p>}

            <p className="max-w-2xl leading-relaxed text-white/90 sm:text-lg">
              {data.overview || 'No synopsis available.'}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={playHref}
                className="inline-flex items-center gap-3 rounded-md bg-white px-9 py-3.5 text-lg font-bold text-black shadow-lg transition hover:bg-blue-50 hover:shadow-[0_0_28px_rgba(59,130,246,0.5)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
              >
                <Play className="size-6 fill-black" />
                {isTv ? `Play S${firstSeason} E1` : 'Play'}
              </Link>
              <WatchlistButton type={type} tmdbId={id} />
            </div>
          </div>
        </div>
      </section>

      {isTv && seasons.length > 0 && (
        <EpisodeSelector
          tvId={id}
          seasons={seasons}
          selectedSeason={selectedSeason}
          onSeasonChange={(season) => setSearchParams({ season: String(season) }, { replace: true })}
        />
      )}

      <MoreLikeThis type={type} id={id} />
    </main>
  )
}

// Lives inside DetailsView, so it remounts (fresh state, row scrolled back to the start)
// whenever the title changes. Hidden entirely when TMDB has nothing to suggest.
function MoreLikeThis({ type, id }: { type: MediaType; id: number }) {
  const [items, setItems] = useState<(Movie | TVShow)[] | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getRecommendations(type, id, { signal: controller.signal })
      .then(setItems)
      .catch(() => {
        if (!controller.signal.aborted) setItems([])
      })
    return () => controller.abort()
  }, [type, id])

  if (items?.length === 0) return null

  return (
    <div className="pt-4 pb-16">
      <MediaRow title="More Like This" type={type} items={items ?? []} isLoading={items === null} />
    </div>
  )
}
