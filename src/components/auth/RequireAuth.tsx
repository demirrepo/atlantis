import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/useAuth'

/** Layout route guard: renders child routes only for signed-in users, otherwise sends them to /auth. */
export default function RequireAuth() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <Loader2 className="size-10 animate-spin text-brand" aria-label="Loading" />
      </main>
    )
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth?redirect=${redirect}`} replace />
  }

  return <Outlet />
}
