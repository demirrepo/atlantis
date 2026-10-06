import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 bg-clip-text text-7xl font-black text-transparent">404</p>
        <p className="mt-2 text-white/70">This page doesn't exist.</p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-500">
          Back home
        </Link>
      </div>
    </main>
  )
}
