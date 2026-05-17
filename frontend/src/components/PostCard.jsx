import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { likePost, unlikePost, deletePost } from '../api/axios'

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [loading, setLoading] = useState(false)

  const isOwner = user?.id === post.user_id

  const handleLike = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (liked) {
        await unlikePost(post.id)
        setLikesCount(prev => prev - 1)
        setLiked(false)
      } else {
        await likePost(post.id)
        setLikesCount(prev => prev + 1)
        setLiked(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    try {
      await deletePost(post.id)
      if (onDelete) onDelete(post.id)
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

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Link
          to={`/profile/${post.users?.username}`}
          className="flex items-center gap-3"
        >
          {post.users?.profile_picture ? (
            <img
              src={post.users.profile_picture}
              alt={post.users.name}
              className="w-10 h-10 rounded-full object-cover border border-zinc-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {post.users?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-white font-medium text-sm">{post.users?.name}</p>
            <p className="text-gray-400 text-xs">@{post.users?.username} · {timeAgo(post.created_at)}</p>
          </div>
        </Link>

        {/* Delete button — only for post owner */}
        {isOwner && (
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-400 transition text-xs"
          >
            Delete
          </button>
        )}
      </div>

      {/* Content */}
      <Link to={`/post/${post.id}`}>
        {post.content && (
          <p className="text-gray-200 text-sm leading-relaxed mb-3">
            {post.content}
          </p>
        )}

        {/* Image */}
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="w-full rounded-xl object-cover max-h-96 mb-3"
          />
        )}

        {/* Video */}
        {post.video_url && (
          <video
            src={post.video_url}
            controls
            className="w-full rounded-xl max-h-96 mb-3"
          />
        )}
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-6 mt-3 pt-3 border-t border-zinc-800">

        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-2 text-sm transition ${
            liked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
          }`}
        >
          <span>{liked ? '❤️' : '🤍'}</span>
          <span>{likesCount}</span>
        </button>

        {/* Comment button */}
        <Link
          to={`/post/${post.id}`}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition"
        >
          <span>💬</span>
          <span>{post.comments_count || 0}</span>
        </Link>

      </div>
    </div>
  )
}

export default PostCard