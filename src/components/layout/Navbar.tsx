import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Bookmark, LogOut, Search } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useAuth } from '@/context/useAuth'
import { authPath } from '@/lib/redirect'

const NAV_LINKS = [
  { to: '/', label: 'Home', requiresAuth: false },
  { to: '/search', label: 'Browse', requiresAuth: false },
  { to: '/my-list', label: 'My List', requiresAuth: true },
]

const PROTECTED_PATHS = ['/my-list']

const iconButton =
  'rounded-full p-2 text-white transition hover:bg-blue-500/15 hover:text-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, isLoading, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    onScroll() // handle a page restored mid-scroll
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    // Leave protected pages first, so the route guard doesn't bounce to /auth
    if (PROTECTED_PATHS.some((p) => location.pathname.startsWith(p))) navigate('/', { replace: true })
    await signOut()
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-500 ${
        isScrolled
          ? 'border-b border-blue-500/10 bg-abyss/95 shadow-lg shadow-blue-950/40 backdrop-blur-md'
          : 'border-b border-transparent bg-gradient-to-b from-abyss/90 via-blue-950/20 to-transparent'
      }`}
    >
      <nav className="flex h-16 items-center gap-8 px-4 sm:px-8 lg:px-12">
        <Link
          to="/"
          aria-label="Atlantis home"
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
        >
          <Logo size="md" />
        </Link>

        <ul className="hidden items-center gap-5 text-sm md:flex">
          {NAV_LINKS.filter((link) => !link.requiresAuth || user).map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  `relative py-1 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-blue-500 after:transition-transform ${
                    isActive
                      ? 'font-semibold text-blue-400 after:scale-x-100'
                      : 'text-white/80 after:scale-x-0 hover:text-blue-300'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link to="/search" aria-label="Search" className={iconButton}>
            <Search className="size-5" />
          </Link>

          {isLoading ? (
            // Reserve space so the bar doesn't jump once the session is known
            <span className="h-9 w-20" aria-hidden="true" />
          ) : user ? (
            <>
              <Link to="/my-list" aria-label="My List" className={`${iconButton} md:hidden`}>
                <Bookmark className="size-5" />
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                title={user.email ?? undefined}
                className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-white/80 ring-1 ring-blue-400/20 transition hover:bg-blue-500/10 hover:text-blue-300 hover:ring-blue-400/50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none sm:px-3"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sr-only sm:hidden">Sign Out</span>
              </button>
            </>
          ) : (
            <Link
              to={authPath(location.pathname + location.search)}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(37,99,235,0.45)] transition hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
