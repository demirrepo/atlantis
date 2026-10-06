import { useEffect } from 'react'

export const DEFAULT_TITLE = 'Atlantis — Stream Movies & TV Shows'

/**
 * Sets the tab title while the calling component is mounted, e.g. "Arrival — Atlantis".
 * Pass nothing (or undefined while data loads) to use the default title.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Atlantis` : DEFAULT_TITLE
    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [title])
}
