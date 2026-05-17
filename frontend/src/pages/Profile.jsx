import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import PostCard from '../components/PostCard'
import FollowButton from '../components/FollowButton'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, getAllPosts } from '../api/axios'

const Profile = () => {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [followersCount, setFollowersCount] = useState(0)

  const isOwnProfile = currentUser?.username === username

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const profileRes = await getUserProfile(username)
        setProfile(profileRes.data.user)
        setFollowersCount(profileRes.data.user.followers_count)

        // Get all posts and filter by this user
        const postsRes = await getAllPosts()
        const userPosts = postsRes.data.posts.filter(
          p => p.user_id === profileRes.data.user.id
        )
        setPosts(userPosts)

      } catch (err) {
        setError('User not found')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [username])

  const handleFollowChange = (isFollowing) => {
    setFollowersCount(prev => isFollowing ? prev + 1 : prev - 1)
  }

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto flex pt-16">
          <LeftSidebar />
          <main className="flex-1 lg:ml-64 px-4 py-6 max-w-2xl mx-auto w-full">
            <div className="h-48 bg-zinc-900 rounded-2xl animate-pulse mb-4" />
            <div className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <Navbar />

      <div className="max-w-6xl mx-auto flex pt-16">

        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main content */}
        <main className="flex-1 lg:ml-64 px-4 py-6 max-w-2xl mx-auto w-full">

          {/* Cover photo */}
          <div className="relative h-48 bg-zinc-900 rounded-2xl overflow-hidden mb-4">
            {profile?.cover_photo ? (
              <img
                src={profile.cover_photo}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-zinc-900" />
            )}
          </div>

          {/* Profile info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6 -mt-12 relative">

            {/* Avatar */}
            <div className="flex items-end justify-between mb-4">
              <div className="w-20 h-20 rounded-full border-4 border-zinc-900 overflow-hidden -mt-10 bg-blue-600 flex items-center justify-center">
                {profile?.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {profile?.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="px-4 py-2 rounded-full text-sm font-semibold bg-zinc-800 border border-zinc-600 text-white hover:bg-zinc-700 transition"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <FollowButton
                    targetUserId={profile?.id}
                    onFollowChange={handleFollowChange}
                  />
                )}
              </div>
            </div>

            {/* Name & username */}
            <h1 className="text-white text-xl font-bold">{profile?.name}</h1>
            <p className="text-gray-400 text-sm mb-3">@{profile?.username}</p>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-gray-300 text-sm mb-4">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-white font-bold">{posts.length}</p>
                <p className="text-gray-400 text-xs">Posts</p>
              </div>
              <Link
                to={`/profile/${username}/followers`}
                className="text-center hover:opacity-80 transition"
              >
                <p className="text-white font-bold">{followersCount}</p>
                <p className="text-gray-400 text-xs">Followers</p>
              </Link>
              <Link
                to={`/profile/${username}/followers`}
                className="text-center hover:opacity-80 transition"
              >
                <p className="text-white font-bold">{profile?.following_count}</p>
                <p className="text-gray-400 text-xs">Following</p>
              </Link>
            </div>

          </div>

          {/* Posts */}
          <h2 className="text-white font-semibold mb-4">Posts</h2>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No posts yet</p>
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
      </div>
    </div>
  )
}

export default Profile