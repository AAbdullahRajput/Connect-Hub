import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getComments, addComment, deleteComment } from '../api/axios'

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

const Avatar = ({ user, size = 36, theme }) => {
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  return user?.profile_picture ? (
    <img
      src={user.profile_picture}
      alt={user.name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        border: `1.5px solid ${theme.border}`,
        flexShrink: 0,
        display: 'block',
      }}
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: theme.avatarGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: size * 0.36,
        fontWeight: '700',
        flexShrink: 0,
        letterSpacing: '0.02em',
      }}
    >
      {initials}
    </div>
  )
}

const CommentItem = ({ comment, user, onDelete, theme }) => {
  const [hovered, setHovered] = useState(false)
  const isOwner = user?.id === comment.user_id

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        gap: '10px',
        padding: '12px',
        borderRadius: '14px',
        background: hovered ? theme.surface : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <Link
        to={`/profile/${comment.users?.username}`}
        style={{ textDecoration: 'none', flexShrink: 0 }}
      >
        <Avatar user={comment.users} size={34} theme={theme} />
      </Link>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '4px 14px 14px 14px',
            padding: '10px 14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '5px',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <Link
                to={`/profile/${comment.users?.username}`}
                style={{ textDecoration: 'none' }}
              >
                <span
                  style={{
                    color: theme.text,
                    fontSize: '0.82rem',
                    fontWeight: '600',
                  }}
                >
                  {comment.users?.name}
                </span>
              </Link>
              <span style={{ color: theme.textHint, fontSize: '0.72rem' }}>
                @{comment.users?.username}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
              }}
            >
              <span style={{ color: theme.textHint, fontSize: '0.68rem' }}>
                {timeAgo(comment.created_at)}
              </span>
              {isOwner && hovered && (
                <button
                  onClick={() => onDelete(comment.id)}
                  title="Delete comment"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.textHint,
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = theme.danger)}
                  onMouseLeave={e => (e.currentTarget.style.color = theme.textHint)}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path
                      d="M2 3.5h9M5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M10 3.5l-.5 7a1 1 0 0 1-1 .9H4.5a1 1 0 0 1-1-.9L3 3.5"
                      stroke="currentColor"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <p
            style={{
              color: theme.textSecondary,
              fontSize: '0.875rem',
              lineHeight: '1.55',
              margin: 0,
              wordBreak: 'break-word',
            }}
          >
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  )
}

const CommentSection = ({ postId }) => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await getComments(postId)
        setComments(res.data.comments)
      } catch {
        // silent
      } finally {
        setFetching(false)
      }
    }
    fetch_()
  }, [postId])

  const handleSubmit = async () => {
    if (!content.trim() || loading) return
    setLoading(true)
    try {
      const res = await addComment(postId, { content: content.trim() })
      setComments(prev => [...prev, res.data.comment])
      setContent('')
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch {
      // silent
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div style={{ fontFamily: theme.font }}>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <h3
          style={{
            color: theme.text,
            fontSize: '0.95rem',
            fontWeight: '700',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M14 10a2 2 0 0 1-2 2H5l-3 2V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z"
              stroke={theme.textMuted}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
          Comments
        </h3>
        {comments.length > 0 && (
          <span
            style={{
              background: theme.accentMuted,
              border: `1px solid ${theme.accentBorder}`,
              color: theme.accentText,
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '2px 9px',
              borderRadius: '100px',
            }}
          >
            {comments.length}
          </span>
        )}
      </div>

      {/* Compose box */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flexShrink: 0, paddingTop: '2px' }}>
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.name}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `1.5px solid ${theme.border}`,
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: theme.avatarGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '700',
              }}
            >
              {initials}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              background: theme.surface,
              border: `1px solid ${focused ? theme.accent : theme.border}`,
              borderRadius: '12px',
              padding: '10px 14px',
              transition: 'border-color 0.2s',
              boxShadow: focused ? `0 0 0 3px ${theme.accentMuted}` : 'none',
            }}
          >
            <input
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Write a comment..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: theme.text,
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: theme.font,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {(focused || content.trim()) && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '8px',
              }}
            >
              <button
                onMouseDown={e => { e.preventDefault(); setContent('') }}
                style={{
                  background: 'transparent',
                  border: `1px solid ${theme.border}`,
                  color: theme.textMuted,
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: theme.font,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = theme.borderHover
                  e.currentTarget.style.color = theme.text
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = theme.border
                  e.currentTarget.style.color = theme.textMuted
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !content.trim()}
                style={{
                  background: !content.trim() || loading ? theme.surface : theme.accent,
                  border: `1px solid ${!content.trim() || loading ? theme.border : 'transparent'}`,
                  color: !content.trim() || loading ? theme.textMuted : '#fff',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: !content.trim() || loading ? 'not-allowed' : 'pointer',
                  fontFamily: theme.font,
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M1 6l9-4-4 9-1.5-3.5L1 6z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments list */}
      {fetching ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                height: '68px',
                background: theme.surface,
                borderRadius: '14px',
                border: `1px solid ${theme.border}`,
              }}
            />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '36px 20px',
            background: theme.surface,
            borderRadius: '14px',
            border: `1px solid ${theme.border}`,
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            style={{ margin: '0 auto 10px', display: 'block', opacity: 0.25 }}
          >
            <path
              d="M28 20a4 4 0 0 1-4 4H10l-6 4V8a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v12z"
              stroke={theme.textMuted}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <p
            style={{
              color: theme.textMuted,
              fontSize: '0.875rem',
              fontWeight: '600',
              margin: '0 0 4px',
            }}
          >
            No comments yet
          </p>
          <p style={{ color: theme.textHint, fontSize: '0.78rem', margin: 0 }}>
            Be the first to share your thoughts
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              user={user}
              onDelete={handleDelete}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentSection