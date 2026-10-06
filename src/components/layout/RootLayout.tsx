import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function RootLayout() {
  return (
    <div className="min-h-dvh bg-abyss text-white">
      <Navbar />
      {/* No top padding: the Navbar floats over the hero. Pages without a hero add pt-16 themselves. */}
      <Outlet />
    </div>
  )
}
