import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LeftSidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/explore', label: 'Explore', icon: '🔍' },
    { path: `/profile/${user?.username}`, label: 'Profile', icon: '👤' },
    { path: '/search', label: 'Search', icon: '🔎' },
  ]

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-zinc-800 px-4 py-6 hidden lg:flex flex-col justify-between">

      {/* Top section */}
      <div>
        {/* User info */}
        <Link
          to={`/profile/${user?.username}`}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition mb-6"
        >
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border border-zinc-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-sm">{user?.name}</p>
            <p className="text-gray-400 text-xs">@{user?.username}</p>
          </div>
        </Link>

        {/* Followers/Following counts */}
        <div className="flex gap-4 px-3 mb-6">
          <Link
            to={`/profile/${user?.username}/followers`}
            className="text-center hover:opacity-80 transition"
          >
            <p className="text-white font-bold text-sm">{user?.followers_count || 0}</p>
            <p className="text-gray-400 text-xs">Followers</p>
          </Link>
          <Link
            to={`/profile/${user?.username}/followers`}
            className="text-center hover:opacity-80 transition"
          >
            <p className="text-white font-bold text-sm">{user?.following_count || 0}</p>
            <p className="text-gray-400 text-xs">Following</p>
          </Link>
          <div className="text-center">
            <p className="text-white font-bold text-sm">{user?.posts_count || 0}</p>
            <p className="text-gray-400 text-xs">Posts</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                isActive(link.path)
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom section — logout */}
      <div>
        <Link
          to="/profile/edit"
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-zinc-900 transition w-full mb-2"
        >
          <span>⚙️</span>
          <span>Edit Profile</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition w-full"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

    </aside>
  )
}

export default LeftSidebar