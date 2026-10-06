import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, Play } from 'lucide-react'
import { getImageUrl, getMovieDetails } from '@/services/tmdbApi'
import { detailsPath, watchPath } from '@/lib/embed'
import type { MovieDetails } from '@/types/tmdb'

const FEATURED_MOVIE_ID = 329865 // Arrival (2016)

export default function HeroBanner() {
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getMovieDetails(FEATURED_MOVIE_ID, { signal: controller.signal })
      .then(setMovie)
      .catch((err: Error) => {
        if (!controller.signal.aborted) setError(err.message)
      })
    return () => controller.abort()
  }, [])

  if (error) {
    return (
      <section className="grid h-[56.25vw] max-h-[85vh] min-h-[420px] place-items-center bg-slate-900 text-white/60">
        Couldn't load the featured title.
      </section>
    )
  }

  if (!movie) {
    return <section className="h-[56.25vw] max-h-[85vh] min-h-[420px] animate-pulse bg-gradient-to-br from-slate-900 to-blue-950/40" />
  }

  const backdrop = getImageUrl(movie.backdrop_path, 'original')
  const logo = movie.images?.logos.find((l) => l.iso_639_1 === 'en') ?? movie.images?.logos[0]
  const year = movie.release_date?.slice(0, 4)

  return (
    <section className="relative h-[56.25vw] max-h-[85vh] min-h-[420px] w-full overflow-hidden">
      {backdrop && (
        <img
          src={backdrop}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover object-top"
        />
      )}

      {/* Vignettes: side shade for text legibility, heavy bottom fade into the page */}
      <div className="absolute inset-0 bg-gradient-to-r from-abyss/95 via-blue-950/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-abyss via-abyss/60 to-transparent" />
      <div className="absolute inset-0 shadow-[inset_0_0_160px_rgba(2,6,23,0.75)]" />

      <div className="relative flex h-full max-w-2xl flex-col justify-end gap-4 px-4 pb-[12%] sm:px-8 lg:px-12">
        {logo ? (
          <img
            src={getImageUrl(logo.file_path, 'w500')!}
            alt={movie.title}
            className="max-h-32 w-auto max-w-[80%] object-contain object-left drop-shadow-2xl sm:max-h-40"
          />
        ) : (
          <h1 className="text-4xl font-black tracking-tight drop-shadow-lg sm:text-6xl">{movie.title}</h1>
        )}

        <div className="flex items-center gap-3 text-sm text-white/80">
          {year && <span>{year}</span>}
          {movie.runtime ? <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span> : null}
          <span className="rounded border border-white/40 px-1.5 text-xs">
            ★ {movie.vote_average.toFixed(1)}
          </span>
        </div>

        <p className="line-clamp-3 max-w-xl text-sm text-white/90 drop-shadow sm:text-base">
          {movie.overview}
        </p>

        <div className="flex items-center gap-3">
          <Link
            to={watchPath('movie', movie.id)}
            className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-2.5 font-semibold text-black transition hover:bg-blue-50 hover:shadow-[0_0_24px_rgba(59,130,246,0.45)]"
          >
            <Play className="size-5 fill-black" />
            Play
          </Link>
          <Link
            to={detailsPath('movie', movie.id)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-950/60 px-6 py-2.5 font-semibold text-white ring-1 ring-blue-400/30 backdrop-blur-sm transition hover:bg-blue-900/60 hover:ring-blue-400/60"
          >
            <Info className="size-5" />
            More Info
          </Link>
        </div>
      </div>
    </section>
  )
}
