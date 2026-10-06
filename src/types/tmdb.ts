export type MediaType = 'movie' | 'tv'

export interface PaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

interface MediaBase {
  id: number
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  genre_ids: number[]
  original_language: string
  popularity: number
  vote_average: number
  vote_count: number
  adult?: boolean
}

export interface Movie extends MediaBase {
  media_type?: 'movie'
  title: string
  original_title: string
  release_date: string
  video: boolean
}

export interface TVShow extends MediaBase {
  media_type?: 'tv'
  name: string
  original_name: string
  first_air_date: string
  origin_country: string[]
}

export interface Person {
  media_type: 'person'
  id: number
  name: string
  profile_path: string | null
  known_for_department: string
  popularity: number
}

export type MultiSearchResult =
  | (Movie & { media_type: 'movie' })
  | (TVShow & { media_type: 'tv' })
  | Person

export type TimeWindow = 'day' | 'week'

export type ImageSize =
  | 'w92'
  | 'w154'
  | 'w185'
  | 'w300'
  | 'w342'
  | 'w500'
  | 'w780'
  | 'w1280'
  | 'original'

export interface Genre {
  id: number
  name: string
}

export interface ImageAsset {
  file_path: string
  aspect_ratio: number
  iso_639_1: string | null
  width: number
  height: number
}

export interface MovieDetails extends Omit<Movie, 'genre_ids' | 'media_type'> {
  genres: Genre[]
  runtime: number | null
  tagline: string
  status: string
  images?: {
    logos: ImageAsset[]
    backdrops: ImageAsset[]
    posters: ImageAsset[]
  }
}

export interface SeasonSummary {
  id: number
  season_number: number
  name: string
  overview: string
  episode_count: number
  air_date: string | null
  poster_path: string | null
}

export interface TVDetails extends Omit<TVShow, 'genre_ids' | 'media_type'> {
  genres: Genre[]
  tagline: string
  status: string
  last_air_date: string | null
  number_of_seasons: number
  number_of_episodes: number
  episode_run_time: number[]
  seasons: SeasonSummary[]
  images?: {
    logos: ImageAsset[]
    backdrops: ImageAsset[]
    posters: ImageAsset[]
  }
}

export interface Episode {
  id: number
  episode_number: number
  season_number: number
  name: string
  overview: string
  still_path: string | null
  runtime: number | null
  air_date: string | null
  vote_average: number
}

export interface SeasonDetails {
  id: number
  season_number: number
  name: string
  overview: string
  air_date: string | null
  poster_path: string | null
  episodes: Episode[]
}
