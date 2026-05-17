import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import RightSidebar from '../components/RightSidebar'
import PostCard from '../components/PostCard'
import { getAllPosts } from '../api/axios'

const Explore = () => {
  const [posts, setPosts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'image', label: 'Images' },
    { key: 'video', label: 'Videos' },
    { key: 'text', label: 'Text' },
  ]

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await getAllPosts()
        setPosts(res.data.posts)
        setFiltered(res.data.posts)
      } catch (err) {
        setError('Failed to load posts')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  // Filter posts by tab
  useEffect(() => {
    if (activeTab === 'all') {
      setFiltered(posts)
    } else {
      setFiltered(posts.filter(p =>
        p.post_type === activeTab || p.post_type === 'mixed'
      ))
    }
  }, [activeTab, posts])

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
    setFiltered(prev => prev.filter(p => p.id !== postId))
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <Navbar />

      {/* Layout */}
      <div className="max-w-6xl mx-auto flex pt-16">

        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Center */}
        <main className="flex-1 lg:ml-64 xl:mr-72 px-4 py-6 max-w-2xl mx-auto w-full">

          {/* Header */}
          <h1 className="text-2xl font-bold text-white mb-6">Explore</h1>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-zinc-900 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No posts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handlePostDeleted}
                />
              ))}
            </div>
          )}

        </main>

        {/* Right Sidebar */}
        <RightSidebar />

      </div>
    </div>
  )
}

export default Explore