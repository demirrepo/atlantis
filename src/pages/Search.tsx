import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2, Search as SearchIcon, X } from 'lucide-react'
import MediaCard from '@/components/media/MediaCard'
import { useDebounce } from '@/hooks/useDebounce'
import { searchMulti } from '@/services/tmdbApi'
import type { Movie, TVShow } from '@/types/tmdb'

type SearchResult = (Movie & { media_type: 'movie' }) | (TVShow & { media_type: 'tv' })

interface SearchState {
  /** The query these results belong to, so stale results are never shown for a newer query */
  query: string
  results: SearchResult[]
  error: string | null
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [input, setInput] = useState(() => searchParams.get('q') ?? '')
  const debouncedQuery = useDebounce(input, 500).trim()
  const [state, setState] = useState<SearchState>({ query: '', results: [], error: null })

  // Keep ?q= in sync so refresh and "back" from the player restore the search
  useEffect(() => {
    setSearchParams(debouncedQuery ? { q: debouncedQuery } : {}, { replace: true })
  }, [debouncedQuery, setSearchParams])

  useEffect(() => {
    if (!debouncedQuery) return
    const controller = new AbortController()
    searchMulti(debouncedQuery, { signal: controller.signal })
      .then(({ results }) => setState({ query: debouncedQuery, results, error: null }))
      .catch((err: Error) => {
        if (!controller.signal.aborted) {
          setState({ query: debouncedQuery, results: [], error: err.message })
        }
      })
    return () => controller.abort()
  }, [debouncedQuery])

  const hasQuery = debouncedQuery.length > 0
  const isLoading = hasQuery && state.query !== debouncedQuery
  const isTyping = input.trim() !== debouncedQuery

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16 sm:px-8 lg:px-12">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-3xl">
        <label htmlFor="search-input" className="sr-only">
          Search movies and TV shows
        </label>
        <div className="group relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-5 size-6 -translate-y-1/2 text-white/50 transition-colors group-focus-within:text-blue-400" />
          <input
            id="search-input"
            type="search"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setInput('')}
            placeholder="Titles, people, genres…"
            className="w-full rounded-lg border border-blue-500/20 bg-slate-900/80 py-4 pr-14 pl-14 text-lg text-white placeholder-white/40 shadow-inner transition outline-none hover:border-blue-500/40 focus:border-blue-500 focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/40 sm:text-xl [&::-webkit-search-cancel-button]:hidden"
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1.5 text-white/60 transition hover:bg-blue-500/15 hover:text-blue-300"
            >
              {isTyping ? <Loader2 className="size-5 animate-spin" /> : <X className="size-5" />}
            </button>
          )}
        </div>
      </form>

      <section aria-live="polite" className="mt-10">
        {!hasQuery ? (
          <p className="text-center text-white/50">Search for movies and TV shows.</p>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-10 animate-spin text-brand" aria-label="Loading results" />
          </div>
        ) : state.error ? (
          <p className="text-center text-red-400">Something went wrong: {state.error}</p>
        ) : state.results.length === 0 ? (
          <p className="py-20 text-center text-lg text-white/60">
            No results found for '<span className="text-white">{debouncedQuery}</span>'
          </p>
        ) : (
          <>
            <h1 className="mb-4 text-sm text-white/60">
              Results for '<span className="text-white">{debouncedQuery}</span>'
            </h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {state.results.map((item) => (
                <MediaCard
                  key={`${item.media_type}-${item.id}`}
                  item={item}
                  type={item.media_type}
                  className="w-full"
                  showTypeBadge
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
