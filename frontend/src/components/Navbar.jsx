import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-zinc-800 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/home" className="text-xl font-bold text-white">
          ConnectHub
        </Link>

        {/* Search bar — center */}
        <div className="hidden md:flex flex-1 max-w-sm mx-8">
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => navigate('/search')}
            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/home"
              className="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-900 transition text-sm"
            >
              Home
            </Link>
            <Link
              to="/explore"
              className="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-900 transition text-sm"
            >
              Explore
            </Link>
            <Link
              to={`/profile/${user?.username}`}
              className="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-900 transition text-sm"
            >
              Profile
            </Link>
          </div>

          {/* Avatar + dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-zinc-800">
                  <p className="text-white text-sm font-medium">{user?.name}</p>
                  <p className="text-gray-400 text-xs">@{user?.username}</p>
                </div>
                <Link
                  to={`/profile/${user?.username}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition"
                >
                  View Profile
                </Link>
                <Link
                  to="/profile/edit"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition"
                >
                  Edit Profile
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar