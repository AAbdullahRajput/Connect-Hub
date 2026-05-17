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
  const [focused, setFocused] = useState(false)

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
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', margin: 0 }}>
          💬 Comments
        </h3>
        <span style={{
          background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
          color: '#60a5fa', fontSize: '0.75rem', fontWeight: '700',
          padding: '3px 10px', borderRadius: '100px'
        }}>
          {comments.length}
        </span>
      </div>

      {/* Add comment box */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '24px',
        background: focused ? 'rgba(37,99,235,0.04)' : '#18181b',
        border: `1px solid ${focused ? 'rgba(37,99,235,0.35)' : '#27272a'}`,
        borderRadius: '16px', padding: '14px',
        transition: 'all 0.2s',
        boxShadow: focused ? '0 0 0 3px rgba(37,99,235,0.08)' : 'none'
      }}>

        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt={user.name} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              objectFit: 'cover', border: '2px solid rgba(37,99,235,0.3)'
            }} />
          ) : (
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '13px', fontWeight: '700'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Input + button */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`Reply as ${user?.name?.split(' ')[0]}...`}
            style={{
              width: '100%', background: 'transparent',
              border: 'none', color: '#fff',
              fontSize: '0.9rem', outline: 'none',
              fontFamily: 'inherit', boxSizing: 'border-box'
            }}
          />

          {/* Action bar — shown when focused or has content */}
          {(focused || content) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#3f3f50', fontSize: '0.72rem' }}>
                Press Enter to post
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setContent(''); setFocused(false) }}
                  style={{
                    background: 'transparent', border: '1px solid #27272a',
                    color: '#71717a', borderRadius: '100px',
                    padding: '5px 14px', fontSize: '0.8rem',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#71717a' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !content.trim()}
                  style={{
                    background: loading || !content.trim()
                      ? '#27272a'
                      : 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                    border: 'none', color: loading || !content.trim() ? '#52525b' : '#fff',
                    borderRadius: '100px', padding: '5px 16px',
                    fontSize: '0.8rem', fontWeight: '700',
                    cursor: loading || !content.trim() ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.2s',
                    boxShadow: !loading && content.trim() ? '0 4px 12px rgba(37,99,235,0.3)' : 'none'
                  }}
                >
                  {loading ? '⏳' : '✦ Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments list */}
      {fetching ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: '72px', background: '#18181b', borderRadius: '14px',
              border: '1px solid #27272a'
            }} />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: '#18181b', borderRadius: '16px',
          border: '1px solid #27272a'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💬</div>
          <p style={{ color: '#52525b', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 4px' }}>
            No comments yet
          </p>
          <p style={{ color: '#3f3f50', fontSize: '0.8rem', margin: 0 }}>
            Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              user={user}
              onDelete={handleDelete}
              timeAgo={timeAgo}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const CommentItem = ({ comment, user, onDelete, timeAgo }) => {
  const [hovered, setHovered] = useState(false)
  const [deleteHovered, setDeleteHovered] = useState(false)
  const isOwner = user?.id === comment.user_id

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', gap: '12px',
        padding: '14px', borderRadius: '16px',
        background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
        transition: 'all 0.2s'
      }}
    >
      {/* Avatar */}
      <Link to={`/profile/${comment.users?.username}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
        {comment.users?.profile_picture ? (
          <img src={comment.users.profile_picture} alt={comment.users.name} style={{
            width: '36px', height: '36px', borderRadius: '50%',
            objectFit: 'cover', border: '2px solid rgba(37,99,235,0.25)',
            transition: 'border-color 0.2s'
          }} />
        ) : (
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '13px', fontWeight: '700', flexShrink: 0
          }}>
            {comment.users?.name?.[0]?.toUpperCase()}
          </div>
        )}
      </Link>

      {/* Bubble */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          background: '#18181b', border: '1px solid #27272a',
          borderRadius: '0 14px 14px 14px', padding: '12px 16px'
        }}>
          {/* Name row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to={`/profile/${comment.users?.username}`} style={{ textDecoration: 'none' }}>
                <span style={{
                  color: '#e4e4e7', fontSize: '0.875rem', fontWeight: '700',
                  transition: 'color 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                  onMouseLeave={e => e.currentTarget.style.color = '#e4e4e7'}
                >
                  {comment.users?.name}
                </span>
              </Link>
              <span style={{ color: '#3f3f50', fontSize: '0.72rem' }}>
                @{comment.users?.username}
              </span>
            </div>

            {isOwner && hovered && (
              <button
                onClick={() => onDelete(comment.id)}
                onMouseEnter={() => setDeleteHovered(true)}
                onMouseLeave={() => setDeleteHovered(false)}
                style={{
                  background: deleteHovered ? 'rgba(239,68,68,0.1)' : 'transparent',
                  border: 'none', color: deleteHovered ? '#f87171' : '#3f3f50',
                  borderRadius: '6px', padding: '3px 8px',
                  fontSize: '0.72rem', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                🗑️ Delete
              </button>
            )}
          </div>

          {/* Content */}
          <p style={{
            color: '#a1a1aa', fontSize: '0.9rem',
            lineHeight: '1.55', margin: 0
          }}>
            {comment.content}
          </p>
        </div>

        {/* Timestamp + actions */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginTop: '6px', paddingLeft: '4px'
        }}>
          <span style={{ color: '#3f3f50', fontSize: '0.72rem' }}>
            {timeAgo(comment.created_at)}
          </span>
          <button style={{
            background: 'none', border: 'none', color: '#3f3f50',
            fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'color 0.2s', padding: 0
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
            onMouseLeave={e => e.currentTarget.style.color = '#3f3f50'}
          >
            👍 Like
          </button>
          <button style={{
            background: 'none', border: 'none', color: '#3f3f50',
            fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'color 0.2s', padding: 0
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
            onMouseLeave={e => e.currentTarget.style.color = '#3f3f50'}
          >
            ↩️ Reply
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommentSection