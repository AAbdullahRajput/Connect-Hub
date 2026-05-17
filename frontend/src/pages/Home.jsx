import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import RightSidebar from '../components/RightSidebar'
import CreatePost from '../components/CreatePost'
import PostCard from '../components/PostCard'
import { getFeedPosts } from '../api/axios'
import { onPostCreated, removeSocketListeners } from '../socket/socket'

const Home = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch feed posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await getFeedPosts()
        setPosts(res.data.posts)
      } catch (err) {
        setError('Failed to load feed')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()

    // Listen for real-time new posts
    onPostCreated((newPost) => {
      setPosts(prev => [newPost, ...prev])
    })

    return () => removeSocketListeners()
  }, [])

  // Add new post to top of feed
  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev])
  }

  // Remove deleted post from feed
  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <Navbar />

      {/* Layout */}
      <div className="max-w-6xl mx-auto flex pt-16">

        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Center Feed */}
        <main className="flex-1 lg:ml-64 xl:mr-72 px-4 py-6 max-w-2xl mx-auto w-full">

          {/* Create Post */}
          <CreatePost onPostCreated={handlePostCreated} />

          {/* Feed */}
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
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-2">Your feed is empty</p>
              <p className="text-gray-500 text-sm">
                Follow some users to see their posts here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
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

export default Home