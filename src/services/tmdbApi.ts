import axios from 'axios'
import type {
  ImageSize,
  MediaType,
  Movie,
  MovieDetails,
  MultiSearchResult,
  PaginatedResponse,
  SeasonDetails,
  TimeWindow,
  TVDetails,
  TVShow,
} from '@/types/tmdb'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

const apiKey = import.meta.env.VITE_TMDB_API_KEY

if (!apiKey) {
  throw new Error('Missing VITE_TMDB_API_KEY. Add it to your .env file.')
}

// TMDB accepts either a v3 API key (query param) or a v4 read access token (Bearer JWT).
const isV4Token = apiKey.startsWith('eyJ')

export const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
    ...(isV4Token && { Authorization: `Bearer ${apiKey}` }),
  },
  params: {
    language: 'en-US',
    ...(!isV4Token && { api_key: apiKey }),
  },
})

tmdb.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)
    const message =
      error.response?.data?.status_message ?? error.message ?? 'TMDB request failed'
    return Promise.reject(new Error(message, { cause: error }))
  },
)

interface RequestOptions {
  page?: number
  signal?: AbortSignal
}

export async function getTrendingMovies(
  timeWindow: TimeWindow = 'week',
  { page = 1, signal }: RequestOptions = {},
): Promise<PaginatedResponse<Movie>> {
  const { data } = await tmdb.get<PaginatedResponse<Movie>>(
    `/trending/movie/${timeWindow}`,
    { params: { page }, signal },
  )
  return data
}

export async function getPopularTVShows({
  page = 1,
  signal,
}: RequestOptions = {}): Promise<PaginatedResponse<TVShow>> {
  const { data } = await tmdb.get<PaginatedResponse<TVShow>>('/tv/popular', {
    params: { page },
    signal,
  })
  return data
}

/** Full movie details: genres, runtime, scores (vote_average/vote_count) and title logos. */
export async function getMovieDetails(
  id: number,
  { signal }: Pick<RequestOptions, 'signal'> = {},
): Promise<MovieDetails> {
  const { data } = await tmdb.get<MovieDetails>(`/movie/${id}`, {
    params: { append_to_response: 'images', include_image_language: 'en,null' },
    signal,
  })
  return data
}

/** Full show details: genres, scores, number_of_seasons, the season list and title logos. */
export async function getTvDetails(
  id: number,
  { signal }: Pick<RequestOptions, 'signal'> = {},
): Promise<TVDetails> {
  const { data } = await tmdb.get<TVDetails>(`/tv/${id}`, {
    params: { append_to_response: 'images', include_image_language: 'en,null' },
    signal,
  })
  return data
}

/** All episodes for one season of a show. */
export async function getTvSeasonDetails(
  tvId: number,
  seasonNumber: number,
  { signal }: Pick<RequestOptions, 'signal'> = {},
): Promise<SeasonDetails> {
  const { data } = await tmdb.get<SeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`, { signal })
  return data
}

type RecommendedItem = (Movie & { media_type: 'movie' }) | (TVShow & { media_type: 'tv' })

/**
 * "More Like This" titles. Uses TMDB's recommendations and falls back to /similar when
 * there are none (common for niche or very new titles). Items without a poster are dropped,
 * and every item is tagged with a media_type (/similar omits it).
 */
export async function getRecommendations(
  type: MediaType,
  id: number,
  { signal }: Pick<RequestOptions, 'signal'> = {},
): Promise<RecommendedItem[]> {
  const fetchList = async (endpoint: 'recommendations' | 'similar') => {
    const { data } = await tmdb.get<PaginatedResponse<Movie | TVShow>>(`/${type}/${id}/${endpoint}`, {
      signal,
    })
    return data.results
      .filter((item) => item.poster_path && item.id !== id)
      .map((item) => ({ ...item, media_type: item.media_type ?? type }) as RecommendedItem)
  }

  const recommendations = await fetchList('recommendations')
  return recommendations.length > 0 ? recommendations : fetchList('similar')
}

/** Searches movies and TV shows together. People are filtered out. */
export async function searchMulti(
  query: string,
  { page = 1, signal }: RequestOptions = {},
): Promise<PaginatedResponse<Exclude<MultiSearchResult, { media_type: 'person' }>>> {
  const trimmed = query.trim()
  if (!trimmed) return { page: 1, results: [], total_pages: 0, total_results: 0 }

  const { data } = await tmdb.get<PaginatedResponse<MultiSearchResult>>('/search/multi', {
    params: { query: trimmed, page, include_adult: false },
    signal,
  })

  return {
    ...data,
    results: data.results.filter(
      (item): item is Exclude<MultiSearchResult, { media_type: 'person' }> =>
        item.media_type === 'movie' || item.media_type === 'tv',
    ),
  }
}

export function getImageUrl(path: string | null | undefined, size: ImageSize = 'w500') {
  return path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null
}

export function getTitle(item: { title: string } | { name: string }) {
  return 'title' in item ? item.title : item.name
}
