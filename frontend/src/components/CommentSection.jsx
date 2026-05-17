import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getComments, addComment, deleteComment } from '../api/axios'

const CommentSection = ({ postId }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Load comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await getComments(postId)
        setComments(res.data.comments)
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    fetchComments()
  }, [postId])

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      const res = await addComment(postId, { content: content.trim() })
      setComments(prev => [...prev, res.data.comment])
      setContent('')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
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
    <div className="mt-6">
      <h3 className="text-white font-semibold mb-4">
        Comments ({comments.length})
      </h3>

      {/* Add comment */}
      <div className="flex gap-3 mb-6">
        {user?.profile_picture ? (
          <img
            src={user.profile_picture}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-zinc-700 flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Write a comment..."
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
          >
            {loading ? '...' : 'Post'}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {fetching ? (
        <p className="text-gray-500 text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {/* Avatar */}
              <Link to={`/profile/${comment.users?.username}`}>
                {comment.users?.profile_picture ? (
                  <img
                    src={comment.users.profile_picture}
                    alt={comment.users.name}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {comment.users?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </Link>

              {/* Comment bubble */}
              <div className="flex-1">
                <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      to={`/profile/${comment.users?.username}`}
                      className="text-white text-sm font-medium hover:underline"
                    >
                      {comment.users?.name}
                    </Link>
                    {user?.id === comment.user_id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-500 hover:text-red-400 text-xs transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">{comment.content}</p>
                </div>
                <p className="text-gray-500 text-xs mt-1 ml-4">
                  {timeAgo(comment.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentSection