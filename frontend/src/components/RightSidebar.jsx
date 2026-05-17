import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSuggestedUsers, searchAll } from '../api/axios'
import UserCard from './UserCard'

const RightSidebar = () => {
  const navigate = useNavigate()
  const [suggested, setSuggested] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const res = await getSuggestedUsers()
        setSuggested(res.data.suggested_users)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSuggested()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery.trim()}`)
    }
  }

  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-72 border-l border-zinc-800 px-4 py-6 hidden xl:flex flex-col gap-6 overflow-y-auto">

      {/* Search bar */}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ConnectHub..."
          className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
        />
      </form>

      {/* Suggested users */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">
          Suggested for you
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-zinc-900 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : suggested.length === 0 ? (
          <p className="text-gray-500 text-sm">No suggestions available</p>
        ) : (
          <div className="space-y-3">
            {suggested.map((suggestedUser) => (
              <UserCard key={suggestedUser.id} user={suggestedUser} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <p className="text-gray-600 text-xs text-center">
          © 2024 ConnectHub · CodeAlpha
        </p>
      </div>

    </aside>
  )
}

export default RightSidebar