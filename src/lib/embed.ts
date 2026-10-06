import type { MediaType } from '@/types/tmdb'

const EMBED_BASE_URL = 'https://atlantic.st/embed'

type EmbedParams =
  | { type: 'movie'; tmdbId: string }
  | { type: 'tv'; tmdbId: string; season: number; episode: number }

export function buildEmbedUrl(params: EmbedParams) {
  if (params.type === 'movie') {
    return `${EMBED_BASE_URL}/movie/${params.tmdbId}`
  }
  return `${EMBED_BASE_URL}/tv/${params.tmdbId}/${params.season}/${params.episode}`
}

export function isMediaType(value: string | undefined): value is MediaType {
  return value === 'movie' || value === 'tv'
}

/** Builds an in-app watch route, e.g. /watch/tv/1399/1/1 */
export function watchPath(type: MediaType, tmdbId: number | string, season = 1, episode = 1) {
  return type === 'movie' ? `/watch/movie/${tmdbId}` : `/watch/tv/${tmdbId}/${season}/${episode}`
}

/** Builds the in-app details route, e.g. /title/movie/329865 */
export function detailsPath(type: MediaType, tmdbId: number | string) {
  return `/title/${type}/${tmdbId}`
}
