import { useId } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  /** Icon only (e.g. tight mobile headers) */
  iconOnly?: boolean
  className?: string
}

const SIZES = {
  sm: { icon: 'size-6', text: 'text-lg', gap: 'gap-1.5' },
  md: { icon: 'size-8', text: 'text-2xl', gap: 'gap-2' },
  lg: { icon: 'size-12', text: 'text-4xl', gap: 'gap-3' },
} as const

export default function Logo({ size = 'md', iconOnly = false, className = '' }: LogoProps) {
  const s = SIZES[size]

  return (
    <span className={`inline-flex items-center select-none ${s.gap} ${className}`}>
      <TridentIcon className={`${s.icon} shrink-0 drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]`} />
      {iconOnly ? (
        <span className="sr-only">Atlantis</span>
      ) : (
        <span
          className={`bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 bg-clip-text font-extrabold tracking-[0.18em] text-transparent uppercase drop-shadow-[0_0_12px_rgba(59,130,246,0.45)] ${s.text}`}
        >
          Atlantis
        </span>
      )}
    </span>
  )
}

export function TridentIcon({ className = '' }: { className?: string }) {
  // Unique gradient id so multiple logos on one page don't collide
  const gradientId = useId()

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="0.5" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Shaft */}
        <path d="M12 2.5V22" />
        {/* Curved outer prongs */}
        <path d="M5 3.5V8a7 7 0 0 0 14 0V3.5" />
        {/* Barbed tips */}
        <path d="M3.5 5.5 5 3.5l1.5 2M10.5 4.5 12 2.5l1.5 2M17.5 5.5 19 3.5l1.5 2" />
        {/* Grip */}
        <path d="M10 18.5h4" />
      </g>
    </svg>
  )
}
