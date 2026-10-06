import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { buildEmbedUrl, isMediaType, watchPath } from '@/lib/embed'

type PlayerParams = {
  type?: string
  tmdbId?: string
  season?: string
  episode?: string
}

function toPositiveInt(value: string | undefined) {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

export default function Player() {
  const { type, tmdbId, season, episode } = useParams<PlayerParams>()
  const navigate = useNavigate()
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)

  if (!isMediaType(type) || !tmdbId || !/^\d+$/.test(tmdbId)) {
    return <Navigate to="/404" replace />
  }

  const seasonNum = toPositiveInt(season)
  const episodeNum = toPositiveInt(episode)

  // /watch/tv/:id with no season/episode → start at S1E1
  if (type === 'tv' && (seasonNum === null || episodeNum === null)) {
    return <Navigate to={watchPath('tv', tmdbId, seasonNum ?? 1, episodeNum ?? 1)} replace />
  }

  const src =
    type === 'movie'
      ? buildEmbedUrl({ type, tmdbId })
      : buildEmbedUrl({ type, tmdbId, season: seasonNum!, episode: episodeNum! })

  const isLoading = loadedSrc !== src

  return (
    <div className="min-h-dvh bg-black">
      <header className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-white/80 transition hover:bg-blue-500/15 hover:text-blue-300"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        {type === 'tv' && (
          <nav className="flex items-center gap-2 text-sm text-white/80" aria-label="Episode navigation">
            <Link
              to={watchPath('tv', tmdbId, seasonNum!, episodeNum! - 1)}
              aria-disabled={episodeNum === 1}
              className="rounded-full p-1.5 transition hover:bg-blue-500/15 hover:text-blue-300 aria-disabled:pointer-events-none aria-disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Previous episode</span>
            </Link>
            <span className="tabular-nums">
              S{seasonNum} · E{episodeNum}
            </span>
            <Link
              to={watchPath('tv', tmdbId, seasonNum!, episodeNum! + 1)}
              className="rounded-full p-1.5 transition hover:bg-blue-500/15 hover:text-blue-300"
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Next episode</span>
            </Link>
          </nav>
        )}
      </header>

      <div className="relative mx-auto aspect-video max-h-[calc(100dvh-4rem)] w-full">
        {isLoading && (
          <div className="absolute inset-0 grid place-items-center bg-black">
            <Loader2 className="size-10 animate-spin text-brand" aria-label="Loading player" />
          </div>
        )}
        <iframe
          key={src}
          src={src}
          title={type === 'movie' ? `Movie ${tmdbId}` : `TV ${tmdbId} S${seasonNum}E${episodeNum}`}
          className="absolute inset-0 size-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="origin"
          onLoad={() => setLoadedSrc(src)}
        />
      </div>
    </div>
  )
}
