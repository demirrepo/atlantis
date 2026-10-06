import { supabase } from '@/lib/supabase'
import type { MediaType } from '@/types/tmdb'

export interface WatchlistEntry {
  id: number | string
  user_id: string
  tmdb_id: number
  media_type: MediaType
  created_at: string
}

const TABLE = 'watchlist'

/** The user's saved titles, most recently added first. */
export async function getWatchlist(userId: string): Promise<WatchlistEntry[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, user_id, tmdb_id, media_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as WatchlistEntry[]
}

export async function isInWatchlist(userId: string, type: MediaType, tmdbId: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id')
    .eq('user_id', userId)
    .eq('media_type', type)
    .eq('tmdb_id', tmdbId)
    .limit(1)
  if (error) throw error
  return data.length > 0
}

export async function addToWatchlist(userId: string, type: MediaType, tmdbId: number) {
  const { error } = await supabase.from(TABLE).insert({ user_id: userId, media_type: type, tmdb_id: tmdbId })
  if (error) throw error
}

export async function removeFromWatchlist(userId: string, type: MediaType, tmdbId: number) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('media_type', type)
    .eq('tmdb_id', tmdbId)
  if (error) throw error
}
