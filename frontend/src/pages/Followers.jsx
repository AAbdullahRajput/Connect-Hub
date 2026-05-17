import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import UserCard from '../components/UserCard'
import { getFollowers, getFollowing } from '../api/axios'

const Followers = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('followers')
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // We need user id from username — fetch profile first
        const profileRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/${username}`
        )
        const profileData = await profileRes.json()
        const userId = profileData.user.id

        // Fetch both lists in parallel
        const [followersRes, followingRes] = await Promise.all([
          getFollowers(userId),
          getFollowing(userId)
        ])

        setFollowers(followersRes.data.followers)
        setFollowing(followingRes.data.following)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [username])

  const list = activeTab === 'followers' ? followers : following

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <Navbar />

      <div className="max-w-6xl mx-auto flex pt-16">

        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main content */}
        <main className="flex-1 lg:ml-64 px-4 py-6 max-w-2xl mx-auto w-full">

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition text-sm"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-white">@{username}</h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800 mb-6">
            <button
              onClick={() => setActiveTab('followers')}
              className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
                activeTab === 'followers'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Followers ({followers.length})
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
                activeTab === 'following'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Following ({following.length})
            </button>
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-zinc-900 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {activeTab === 'followers'
                  ? 'No followers yet'
                  : 'Not following anyone yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((u) => (
                <UserCard key={u.id} user={u} />
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default Followers