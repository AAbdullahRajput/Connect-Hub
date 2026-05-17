import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import CommentSection from '../components/CommentSection'
import { useAuth } from '../context/AuthContext'
import { getSinglePost, likePost, unlikePost, deletePost } from '../api/axios'
import { joinPost, leavePost, onPostLiked, removeSocketListeners } from '../socket/socket'

const PostDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await getSinglePost(id)
        setPost(res.data.post)
        setLikesCount(res.data.post.likes_count)
      } catch (err) {
        setError('Post not found')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()

    // Join socket room for this post
    joinPost(id)

    // Listen for real-time like updates
    onPostLiked((data) => {
      if (data.post_id === id) {
        setLikesCount(data.likes_count)
      }
    })

    return () => {
      leavePost(id)
      removeSocketListeners()
    }
  }, [id])

  const handleLike = async () => {
    if (likeLoading) return
    setLikeLoading(true)
    try {
      if (liked) {
        await unlikePost(id)
        setLikesCount(prev => prev - 1)
        setLiked(false)
      } else {
        await likePost(id)
        setLikesCount(prev => prev + 1)
        setLiked(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLikeLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    try {
      await deletePost(id)
      navigate('/home')
    } catch (err) {
      console.error(err)
    }
  }

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto flex pt-16">
          <LeftSidebar />
          <main className="flex-1 lg:ml-64 px-4 py-6 max-w-2xl mx-auto w-full">
            <div className="h-96 bg-zinc-900 rounded-2xl animate-pulse" />
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

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6 text-sm"
          >
            ← Back
          </button>

          {/* Post card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <Link
                to={`/profile/${post?.users?.username}`}
                className="flex items-center gap-3"
              >
                {post?.users?.profile_picture ? (
                  <img
                    src={post.users.profile_picture}
                    alt={post.users.name}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {post?.users?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold">{post?.users?.name}</p>
                  <p className="text-gray-400 text-sm">
                    @{post?.users?.username} · {timeAgo(post?.created_at)}
                  </p>
                </div>
              </Link>

              {/* Delete button */}
              {user?.id === post?.user_id && (
                <button
                  onClick={handleDelete}
                  className="text-gray-500 hover:text-red-400 transition text-sm"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Content */}
            {post?.content && (
              <p className="text-gray-200 leading-relaxed mb-4">
                {post.content}
              </p>
            )}

            {/* Image */}
            {post?.image_url && (
              <img
                src={post.image_url}
                alt="Post"
                className="w-full rounded-xl object-cover max-h-96 mb-4"
              />
            )}

            {/* Video */}
            {post?.video_url && (
              <video
                src={post.video_url}
                controls
                className="w-full rounded-xl max-h-96 mb-4"
              />
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-zinc-800">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex items-center gap-2 text-sm transition ${
                  liked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <span>{liked ? '❤️' : '🤍'}</span>
                <span>{likesCount} likes</span>
              </button>
              <span className="text-gray-400 text-sm">
                💬 {post?.comments_count || 0} comments
              </span>
            </div>

          </div>

          {/* Comments */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <CommentSection postId={id} />
          </div>

        </main>
      </div>
    </div>
  )
}

export default PostDetails