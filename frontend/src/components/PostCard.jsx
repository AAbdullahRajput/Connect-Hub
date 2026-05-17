import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { likePost, unlikePost, deletePost } from '../api/axios'

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState(false)
  const isOwner = user?.id === post.user_id

  const handleLike = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (liked) { await unlikePost(post.id); setLikesCount(p => p - 1); setLiked(false) }
      else { await likePost(post.id); setLikesCount(p => p + 1); setLiked(true) }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    try { await deletePost(post.id); if (onDelete) onDelete(post.id) }
    catch (err) { console.error(err) }
  }

  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: theme.card,
        border: `1px solid ${hovered ? theme.borderHover : theme.border}`,
        borderRadius: '20px', padding: '20px',
        transition: 'all 0.2s', fontFamily: theme.font
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: '14px'
      }}>
        <Link to={`/profile/${post.users?.username}`} style={{
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          {post.users?.profile_picture ? (
            <img src={post.users.profile_picture} alt={post.users.name} style={{
              width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover',
              border: `2px solid ${theme.accentBorder}`
            }} />
          ) : (
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
              background: theme.avatarGradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '700', fontSize: '16px'
            }}>
              {post.users?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p style={{
              color: theme.text, fontWeight: '600',
              fontSize: '0.9rem', margin: '0 0 2px'
            }}>
              {post.users?.name}
            </p>
            <p style={{ color: theme.textMuted, fontSize: '0.78rem', margin: 0 }}>
              @{post.users?.username} · {timeAgo(post.created_at)}
            </p>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Post type badge */}
          {post.post_type !== 'text' && (
            <span style={{
              background: theme.accentMuted,
              border: `1px solid ${theme.accentBorder}`,
              color: theme.accentText, fontSize: '0.68rem', fontWeight: '600',
              padding: '3px 8px', borderRadius: '100px',
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {post.post_type}
            </span>
          )}

          {/* Delete button */}
          {isOwner && (
            <button onClick={handleDelete} style={{
              background: 'transparent', border: 'none',
              color: theme.textHint, cursor: 'pointer',
              fontSize: '13px', padding: '4px 8px',
              borderRadius: '6px', transition: 'all 0.2s'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.color = theme.danger
                e.currentTarget.style.background = theme.dangerMuted
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = theme.textHint
                e.currentTarget.style.background = 'transparent'
              }}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <Link to={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
        {post.content && (
          <p style={{
            color: theme.textSecondary, fontSize: '0.95rem', lineHeight: '1.65',
            marginBottom: post.image_url || post.video_url ? '14px' : '0'
          }}>
            {post.content}
          </p>
        )}
        {post.image_url && (
          <img src={post.image_url} alt="Post" style={{
            width: '100%', borderRadius: '14px', objectFit: 'cover',
            maxHeight: '400px', border: `1px solid ${theme.border}`,
            display: 'block', marginBottom: '4px'
          }} />
        )}
        {post.video_url && (
          <video src={post.video_url} controls style={{
            width: '100%', borderRadius: '14px', maxHeight: '400px',
            border: `1px solid ${theme.border}`, display: 'block'
          }} />
        )}
      </Link>

      {/* Actions */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        marginTop: '16px', paddingTop: '14px',
        borderTop: `1px solid ${theme.border}`
      }}>
        {/* Like */}
        <button onClick={handleLike} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '7px 14px', borderRadius: '100px', border: 'none',
          background: liked ? theme.dangerMuted : 'transparent',
          color: liked ? theme.danger : theme.textMuted,
          fontSize: '0.875rem', cursor: 'pointer',
          transition: 'all 0.2s', fontFamily: theme.font, fontWeight: '500'
        }}
          onMouseEnter={e => {
            if (!liked) {
              e.currentTarget.style.background = theme.dangerMuted
              e.currentTarget.style.color = theme.danger
            }
          }}
          onMouseLeave={e => {
            if (!liked) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = theme.textMuted
            }
          }}
        >
          <span style={{ fontSize: '16px' }}>{liked ? '❤️' : '🤍'}</span>
          <span>{likesCount}</span>
        </button>

        {/* Comment */}
        <Link to={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '7px 14px', borderRadius: '100px', border: 'none',
            background: 'transparent', color: theme.textMuted,
            fontSize: '0.875rem', cursor: 'pointer',
            transition: 'all 0.2s', fontFamily: theme.font, fontWeight: '500'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = theme.accentMuted
              e.currentTarget.style.color = theme.accentText
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = theme.textMuted
            }}
          >
            <span style={{ fontSize: '16px' }}>💬</span>
            <span>{post.comments_count || 0}</span>
          </button>
        </Link>

        {/* Engagement score */}
        <div style={{
          marginLeft: 'auto', display: 'flex',
          alignItems: 'center', gap: '4px'
        }}>
          <span style={{ fontSize: '11px' }}>🔥</span>
          <span style={{ color: theme.textHint, fontSize: '0.75rem' }}>
            {post.engagement_score || 0}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PostCard