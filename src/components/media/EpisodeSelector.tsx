import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Loader2, Play } from 'lucide-react'
import { getImageUrl, getTvSeasonDetails } from '@/services/tmdbApi'
import { watchPath } from '@/lib/embed'
import type { Episode, SeasonDetails, SeasonSummary } from '@/types/tmdb'

interface EpisodeSelectorProps {
  tvId: number
  seasons: SeasonSummary[]
  selectedSeason: number
  onSeasonChange: (seasonNumber: number) => void
}

interface SeasonState {
  season: number
  data: SeasonDetails | null
  error: string | null
}

export default function EpisodeSelector({ tvId, seasons, selectedSeason, onSeasonChange }: EpisodeSelectorProps) {
  const [state, setState] = useState<SeasonState | null>(null)
  // Local YYYY-MM-DD, read once so rendering stays pure
  const [today] = useState(() => new Date().toLocaleDateString('en-CA'))

  useEffect(() => {
    const controller = new AbortController()
    getTvSeasonDetails(tvId, selectedSeason, { signal: controller.signal })
      .then((data) => setState({ season: selectedSeason, data, error: null }))
      .catch((err: Error) => {
        if (!controller.signal.aborted) setState({ season: selectedSeason, data: null, error: err.message })
      })
    return () => controller.abort()
  }, [tvId, selectedSeason])

  // Ignore results that belong to a previously selected season
  const current = state?.season === selectedSeason ? state : null

  return (
    <section className="px-4 pb-6 sm:px-8 lg:px-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-500/15 pb-4">
        <h2 className="text-2xl font-semibold">Episodes</h2>

        <div className="relative">
          <label htmlFor="season-select" className="sr-only">
            Season
          </label>
          <select
            id="season-select"
            value={selectedSeason}
            onChange={(e) => onSeasonChange(Number(e.target.value))}
            className="cursor-pointer appearance-none rounded-md border border-blue-500/30 bg-slate-900 py-2.5 pr-11 pl-4 font-medium text-white transition outline-none hover:border-blue-500/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.season_number} className="bg-slate-900">
                {s.name} ({s.episode_count} {s.episode_count === 1 ? 'Episode' : 'Episodes'})
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-blue-400" />
        </div>
      </div>

      {!current ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-9 animate-spin text-brand" aria-label="Loading episodes" />
        </div>
      ) : current.error ? (
        <p className="py-10 text-center text-red-400">Couldn't load episodes: {current.error}</p>
      ) : current.data && current.data.episodes.length > 0 ? (
        <ol className="divide-y divide-blue-500/10">
          {current.data.episodes.map((episode) => (
            <EpisodeRow key={episode.id} tvId={tvId} episode={episode} today={today} />
          ))}
        </ol>
      ) : (
        <p className="py-10 text-center text-white/60">No episodes listed for this season yet.</p>
      )}
    </section>
  )
}

function EpisodeRow({ tvId, episode, today }: { tvId: number; episode: Episode; today: string }) {
  const still = getImageUrl(episode.still_path, 'w300')
  const href = watchPath('tv', tvId, episode.season_number, episode.episode_number)
  const isUpcoming = !episode.air_date || episode.air_date > today

  return (
    <li className="group flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
      <span className="hidden w-8 shrink-0 text-center text-2xl font-semibold text-blue-400/70 tabular-nums sm:block">
        {episode.episode_number}
      </span>

      <Link
        to={href}
        tabIndex={-1}
        aria-hidden="true"
        className={`relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-slate-800 ring-blue-500/70 transition group-hover:ring-2 sm:w-44 lg:w-52 ${isUpcoming ? 'pointer-events-none' : ''}`}
      >
        {still && <img src={still} alt="" loading="lazy" className="size-full object-cover" />}
        {!isUpcoming && (
          <span className="absolute inset-0 grid place-items-center bg-blue-950/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="size-10 fill-white" />
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-semibold">
            <span className="text-white/50 sm:hidden">{episode.episode_number}. </span>
            {episode.name}
          </h3>
          {episode.runtime ? (
            <span className="shrink-0 text-sm text-white/60">{episode.runtime}m</span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-white/70">
          {isUpcoming
            ? episode.air_date
              ? `Coming ${new Date(`${episode.air_date}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
              : 'Air date to be announced'
            : episode.overview || 'No description available.'}
        </p>
      </div>

      {isUpcoming ? (
        <span className="shrink-0 self-start rounded-md border border-white/15 px-4 py-2 text-sm text-white/40 sm:self-center">
          Not aired
        </span>
      ) : (
        <Link
          to={href}
          aria-label={`Play episode ${episode.episode_number}: ${episode.name}`}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-blue-50 hover:shadow-[0_0_16px_rgba(59,130,246,0.4)] sm:self-center"
        >
          <Play className="size-4 fill-black" />
          Play
        </Link>
      )}
    </li>
  )
}
