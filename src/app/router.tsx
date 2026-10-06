import { createBrowserRouter, Outlet, ScrollRestoration } from 'react-router-dom'
import RequireAuth from '@/components/auth/RequireAuth'
import RootLayout from '@/components/layout/RootLayout'
import Auth from '@/pages/Auth'
import Details from '@/pages/Details'
import Home from '@/pages/Home'
import MyList from '@/pages/MyList'
import NotFound from '@/pages/NotFound'
import Player from '@/pages/Player'
import Search from '@/pages/Search'

export const router = createBrowserRouter([
  {
    // App shell: new pages start at the top, "back" restores the previous scroll position
    element: (
      <>
        <ScrollRestoration />
        <Outlet />
      </>
    ),
    children: [
      {
        element: <RootLayout />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/search', element: <Search /> },
          { path: '/title/:type/:tmdbId', element: <Details /> },
          {
            // Signed-in users only; others are sent to /auth?redirect=…
            element: <RequireAuth />,
            children: [{ path: '/my-list', element: <MyList /> }],
          },
          { path: '*', element: <NotFound /> },
        ],
      },
      // Full-bleed pages, outside the main layout (no navbar)
      { path: '/auth', element: <Auth /> },
      { path: '/watch/:type/:tmdbId/:season?/:episode?', element: <Player /> },
    ],
  },
])
