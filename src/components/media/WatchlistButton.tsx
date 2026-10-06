import { useLocation, useNavigate } from 'react-router-dom'
import { Check, Loader2, Plus } from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import { useWatchlistStatus } from '@/hooks/useWatchlistStatus'
import { authPath } from '@/lib/redirect'
import type { MediaType } from '@/types/tmdb'

export default function WatchlistButton({ type, tmdbId }: { type: MediaType; tmdbId: number }) {
  const { isLoading: isAuthLoading } = useAuth()
  const { isSignedIn, isSaved, isChecking, isPending, error, toggle } = useWatchlistStatus(type, tmdbId)
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = () => {
    if (!isSignedIn) {
      navigate(authPath(location.pathname + location.search))
      return
    }
    void toggle()
  }

  const isBusy = isAuthLoading || isChecking

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        disabled={isBusy || isPending}
        aria-pressed={isSignedIn ? isSaved : undefined}
        className={`inline-flex items-center gap-2.5 rounded-md px-6 py-3.5 text-lg font-semibold ring-1 backdrop-blur-sm transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 disabled:cursor-wait ${
          isSaved
            ? 'bg-cyan-500/15 text-cyan-300 ring-cyan-400/50 hover:bg-cyan-500/25'
            : 'bg-blue-950/60 text-white ring-blue-400/30 hover:bg-blue-900/60 hover:ring-blue-400/60'
        }`}
      >
        {isBusy ? (
          <Loader2 className="size-6 animate-spin" />
        ) : isSaved ? (
          <Check className="size-6" strokeWidth={2.5} />
        ) : (
          <Plus className="size-6" strokeWidth={2.5} />
        )}
        {isSaved ? 'In My List' : 'My List'}
      </button>
      {error && (
        <span role="alert" className="absolute top-full left-0 mt-2 text-sm whitespace-nowrap text-red-400">
          Couldn't update My List. Try again.
        </span>
      )}
    </span>
  )
}
