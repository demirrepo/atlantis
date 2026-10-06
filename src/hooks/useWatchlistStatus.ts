import { useEffect, useState } from 'react'
import { useAuth } from '@/context/useAuth'
import { addToWatchlist, isInWatchlist, removeFromWatchlist } from '@/services/watchlistApi'
import type { MediaType } from '@/types/tmdb'

/** Whether one title is in the signed-in user's list, plus an optimistic toggle. */
export function useWatchlistStatus(type: MediaType, tmdbId: number) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  // Status is stored with the key it belongs to, so a different user/title never sees stale data
  const key = userId ? `${userId}:${type}:${tmdbId}` : null
  const [status, setStatus] = useState<{ key: string; saved: boolean } | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || !key) return
    let cancelled = false
    isInWatchlist(userId, type, tmdbId)
      .then((saved) => !cancelled && setStatus({ key, saved }))
      .catch(() => !cancelled && setStatus({ key, saved: false }))
    return () => {
      cancelled = true
    }
  }, [userId, key, type, tmdbId])

  const isChecking = key !== null && status?.key !== key
  const isSaved = key !== null && status?.key === key && status.saved

  const toggle = async () => {
    if (!userId || !key || isPending || isChecking) return
    const next = !isSaved
    setError(null)
    setStatus({ key, saved: next }) // optimistic
    setIsPending(true)
    try {
      if (next) await addToWatchlist(userId, type, tmdbId)
      else await removeFromWatchlist(userId, type, tmdbId)
    } catch (err) {
      setStatus({ key, saved: !next }) // roll back
      setError(err instanceof Error ? err.message : "Couldn't update My List")
    } finally {
      setIsPending(false)
    }
  }

  return { isSignedIn: !!userId, isSaved, isChecking, isPending, error, toggle }
}
