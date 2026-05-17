import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getComments, addComment, deleteComment } from '../api/axios'

const CommentSection = ({ postId }) => {
  const { user } = useAuth()
  const { theme } = useTheme()
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
    <div style={{ fontFamily: theme.font }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: theme.text, fontSize: '1rem', fontWeight: '700', margin: 0 }}>
          💬 Comments
        </h3>
        <span style={{
          background: theme.accentMuted, border: `1px solid ${theme.accentBorder}`,
          color: theme.accentText, fontSize: '0.75rem', fontWeight: '700',
          padding: '3px 10px', borderRadius: '100px'
        }}>
          {comments.length}
        </span>
      </div>

      {/* Add comment box */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '24px',
        background: focused ? theme.accentMuted : theme.card,
        border: `1px solid ${focused ? theme.accentBorder : theme.border}`,
        borderRadius: '16px', padding: '14px',
        transition: 'all 0.2s',
        boxShadow: focused ? `0 0 0 3px ${theme.accentMuted}` : 'none'
      }}>

        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt={user.name} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              objectFit: 'cover', border: `2px solid ${theme.accentBorder}`
            }} />
          ) : (
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: theme.avatarGradient,
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
              border: 'none', color: theme.text,
              fontSize: '0.9rem', outline: 'none',
              fontFamily: theme.font, boxSizing: 'border-box'
            }}
          />

          {(focused || content) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: theme.textHint, fontSize: '0.72rem' }}>
                Press Enter to post
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setContent(''); setFocused(false) }}
                  style={{
                    background: 'transparent', border: `1px solid ${theme.border}`,
                    color: theme.textMuted, borderRadius: '100px',
                    padding: '5px 14px', fontSize: '0.8rem',
                    cursor: 'pointer', fontFamily: theme.font, transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = theme.borderHover; e.currentTarget.style.color = theme.text }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !content.trim()}
                  style={{
                    background: loading || !content.trim()
                      ? theme.surface
                      : `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                    border: 'none',
                    color: loading || !content.trim() ? theme.textMuted : '#fff',
                    borderRadius: '100px', padding: '5px 16px',
                    fontSize: '0.8rem', fontWeight: '700',
                    cursor: loading || !content.trim() ? 'not-allowed' : 'pointer',
                    fontFamily: theme.font, transition: 'all 0.2s',
                    boxShadow: !loading && content.trim()
                      ? `0 4px 12px ${theme.accentMuted}`
                      : 'none'
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
              height: '72px', background: theme.card, borderRadius: '14px',
              border: `1px solid ${theme.border}`
            }} />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: theme.card, borderRadius: '16px',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💬</div>
          <p style={{ color: theme.textMuted, fontSize: '0.9rem', fontWeight: '600', margin: '0 0 4px' }}>
            No comments yet
          </p>
          <p style={{ color: theme.textHint, fontSize: '0.8rem', margin: 0 }}>
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
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const CommentItem = ({ comment, user, onDelete, timeAgo, theme }) => {
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
        background: hovered ? theme.surface : 'transparent',
        border: `1px solid ${hovered ? theme.border : 'transparent'}`,
        transition: 'all 0.2s'
      }}
    >
      {/* Avatar */}
      <Link to={`/profile/${comment.users?.username}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
        {comment.users?.profile_picture ? (
          <img src={comment.users.profile_picture} alt={comment.users.name} style={{
            width: '36px', height: '36px', borderRadius: '50%',
            objectFit: 'cover', border: `2px solid ${theme.accentBorder}`
          }} />
        ) : (
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: theme.avatarGradient,
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
          background: theme.card, border: `1px solid ${theme.border}`,
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
                  color: theme.text, fontSize: '0.875rem', fontWeight: '700',
                  transition: 'color 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.color = theme.accentText}
                  onMouseLeave={e => e.currentTarget.style.color = theme.text}
                >
                  {comment.users?.name}
                </span>
              </Link>
              <span style={{ color: theme.textHint, fontSize: '0.72rem' }}>
                @{comment.users?.username}
              </span>
            </div>

            {isOwner && hovered && (
              <button
                onClick={() => onDelete(comment.id)}
                onMouseEnter={() => setDeleteHovered(true)}
                onMouseLeave={() => setDeleteHovered(false)}
                style={{
                  background: deleteHovered ? theme.dangerMuted : 'transparent',
                  border: 'none',
                  color: deleteHovered ? theme.danger : theme.textHint,
                  borderRadius: '6px', padding: '3px 8px',
                  fontSize: '0.72rem', cursor: 'pointer',
                  fontFamily: theme.font, transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                🗑️ Delete
              </button>
            )}
          </div>

          {/* Content */}
          <p style={{
            color: theme.textSecondary, fontSize: '0.9rem',
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
          <span style={{ color: theme.textHint, fontSize: '0.72rem' }}>
            {timeAgo(comment.created_at)}
          </span>
          <button style={{
            background: 'none', border: 'none', color: theme.textHint,
            fontSize: '0.72rem', cursor: 'pointer', fontFamily: theme.font,
            transition: 'color 0.2s', padding: 0
          }}
            onMouseEnter={e => e.currentTarget.style.color = theme.accentText}
            onMouseLeave={e => e.currentTarget.style.color = theme.textHint}
          >
            👍 Like
          </button>
          <button style={{
            background: 'none', border: 'none', color: theme.textHint,
            fontSize: '0.72rem', cursor: 'pointer', fontFamily: theme.font,
            transition: 'color 0.2s', padding: 0
          }}
            onMouseEnter={e => e.currentTarget.style.color = theme.accentText}
            onMouseLeave={e => e.currentTarget.style.color = theme.textHint}
          >
            ↩️ Reply
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommentSection