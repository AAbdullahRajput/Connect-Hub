import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import PostCard from '../components/PostCard'
import UserCard from '../components/UserCard'
import { searchAll } from '../api/axios'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState('all')
  const [results, setResults] = useState({ users: [], posts: [] })
  const [loading, setLoading] = useState(false)

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'users', label: 'Users' },
    { key: 'posts', label: 'Posts' },
    { key: 'images', label: 'Images' },
    { key: 'videos', label: 'Videos' },
  ]

  // Search when query changes
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      handleSearch(q)
    }
  }, [searchParams])

  const handleSearch = async (q = query, type = activeTab) => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const res = await searchAll(q.trim(), type)
      setResults({
        users: res.data.users || [],
        posts: res.data.posts || []
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (query.trim()) {
      handleSearch(query, tab)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
      handleSearch(query)
    }
  }

  const handlePostDeleted = (postId) => {
    setResults(prev => ({
      ...prev,
      posts: prev.posts.filter(p => p.id !== postId)
    }))
  }

  const totalResults = (results.users?.length || 0) + (results.posts?.length || 0)

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <Navbar />

      <div className="max-w-6xl mx-auto flex pt-16">

        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main content */}
        <main className="flex-1 lg:ml-64 px-4 py-6 max-w-2xl mx-auto w-full">

          {/* Search input */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users, posts..."
                className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-full px-5 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-semibold transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-zinc-900 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : !query.trim() ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-2">Search ConnectHub</p>
              <p className="text-gray-500 text-sm">
                Find users, posts, images and videos
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No results for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Users section */}
              {results.users?.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">
                    Users ({results.users.length})
                  </h3>
                  <div className="space-y-3">
                    {results.users.map((u) => (
                      <UserCard key={u.id} user={u} />
                    ))}
                  </div>
                </div>
              )}

              {/* Posts section */}
              {results.posts?.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">
                    Posts ({results.posts.length})
                  </h3>
                  <div className="space-y-4">
                    {results.posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onDelete={handlePostDeleted}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default Search