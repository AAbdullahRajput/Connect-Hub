import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import CommentSection from '../components/CommentSection'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getSinglePost, likePost, unlikePost, deletePost } from '../api/axios'
import { joinPost, leavePost, onPostLiked, removeSocketListeners } from '../socket/socket'

const PostDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { theme } = useTheme()
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
    joinPost(id)
    onPostLiked((data) => {
      if (data.post_id === id) setLikesCount(data.likes_count)
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
    return `${Math.floor(hrs / 24)}d ago`
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.bg, fontFamily: theme.font }}>
        <Navbar />
        <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', paddingTop: '64px' }}>
          <LeftSidebar />
          <main style={{ flex: 1, marginLeft: '260px', padding: '32px 24px' }}>
            <div style={{
              height: '400px', background: theme.card,
              borderRadius: '20px', border: `1px solid ${theme.border}`
            }} />
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: theme.bg,
        fontFamily: theme.font, display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <p style={{ color: theme.danger, fontSize: '1rem' }}>{error}</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bg,
      fontFamily: theme.font,
      color: theme.text
    }}>
      <Navbar />

      <div style={{
        display: 'flex',
        maxWidth: '1400px',
        margin: '0 auto',
        paddingTop: '64px'
      }}>
        <LeftSidebar />

        <main style={{
          flex: 1,
          marginLeft: '260px',
          padding: '32px 24px',
          maxWidth: '720px',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.textSecondary,
              borderRadius: '10px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontFamily: theme.font,
              marginBottom: '24px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = theme.borderHover
              e.currentTarget.style.color = theme.text
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = theme.border
              e.currentTarget.style.color = theme.textSecondary
            }}
          >
            ← Back
          </button>

          {/* Post card */}
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <Link
                to={`/profile/${post?.users?.username}`}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                {post?.users?.profile_picture ? (
                  <img
                    src={post.users.profile_picture}
                    alt={post.users.name}
                    style={{
                      width: '48px', height: '48px',
                      borderRadius: '50%', objectFit: 'cover',
                      border: `2px solid ${theme.accentBorder}`
                    }}
                  />
                ) : (
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: theme.avatarGradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: '700', fontSize: '18px'
                  }}>
                    {post?.users?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p style={{
                    color: theme.text,
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    margin: '0 0 2px'
                  }}>
                    {post?.users?.name}
                  </p>
                  <p style={{ color: theme.textMuted, fontSize: '0.82rem', margin: 0 }}>
                    @{post?.users?.username} · {timeAgo(post?.created_at)}
                  </p>
                </div>
              </Link>

              {user?.id === post?.user_id && (
                <button
                  onClick={handleDelete}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.textMuted,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontFamily: theme.font,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = theme.danger
                    e.currentTarget.style.background = theme.dangerMuted
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = theme.textMuted
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  🗑️ Delete
                </button>
              )}
            </div>

            {/* Content */}
            {post?.content && (
              <p style={{
                color: theme.text,
                fontSize: '1rem',
                lineHeight: '1.7',
                margin: '0 0 16px'
              }}>
                {post.content}
              </p>
            )}

            {/* Image */}
            {post?.image_url && (
              <img
                src={post.image_url}
                alt="Post"
                style={{
                  width: '100%',
                  borderRadius: '14px',
                  objectFit: 'cover',
                  maxHeight: '500px',
                  border: `1px solid ${theme.border}`,
                  marginBottom: '16px',
                  display: 'block'
                }}
              />
            )}

            {/* Video */}
            {post?.video_url && (
              <video
                src={post.video_url}
                controls
                style={{
                  width: '100%',
                  borderRadius: '14px',
                  maxHeight: '500px',
                  border: `1px solid ${theme.border}`,
                  marginBottom: '16px',
                  display: 'block'
                }}
              />
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingTop: '16px',
              borderTop: `1px solid ${theme.border}`
            }}>
              <button
                onClick={handleLike}
                disabled={likeLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '8px 16px', borderRadius: '100px', border: 'none',
                  background: liked ? theme.dangerMuted : 'transparent',
                  color: liked ? theme.danger : theme.textMuted,
                  fontSize: '0.9rem', cursor: 'pointer',
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
                <span>{liked ? '❤️' : '🤍'}</span>
                <span>{likesCount} likes</span>
              </button>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '8px 16px', color: theme.textMuted, fontSize: '0.9rem'
              }}>
                <span>💬</span>
                <span>{post?.comments_count || 0} comments</span>
              </div>
            </div>
          </div>

          {/* Comments section */}
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '24px'
          }}>
            <CommentSection postId={id} />
          </div>

        </main>
      </div>
    </div>
  )
}

export default PostDetails