import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import CommentSection from '../components/CommentSection'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getSinglePost, likePost, unlikePost, deletePost } from '../api/axios'
import { joinPost, leavePost, onPostLiked, removeSocketListeners } from '../socket/socket'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const BackIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M9 2L4 7l5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const HeartIcon = ({ filled, color, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={filled ? color : 'none'} aria-hidden="true">
    <path
      d="M8 13.5S2 9.5 2 5.5A3.5 3.5 0 0 1 8 3.5 3.5 3.5 0 0 1 14 5.5c0 4-6 8-6 8z"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
)

const CommentIcon = ({ color, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M14 10a2 2 0 0 1-2 2H5l-3 2V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
)

const TrashIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M11 3.5l-.6 7.5a1 1 0 0 1-1 .9H4.6a1 1 0 0 1-1-.9L3 3.5"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const WarningIcon = ({ color }) => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true"
    style={{ display: 'block', margin: '0 auto', opacity: 0.3 }}>
    <path
      d="M18 4L33 30H3L18 4Z"
      stroke={color} strokeWidth="2" strokeLinejoin="round"
    />
    <path d="M18 14v8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="18" cy="25" r="1.2" fill={color} />
  </svg>
)

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonPost = ({ theme }) => (
  <div style={{
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '16px',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(90deg, transparent 0%, ${theme.border}50 50%, transparent 100%)`,
      animation: 'shimmer 1.4s infinite',
    }} />
    {/* Avatar + name row */}
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: theme.border, flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
        <div style={{ width: '140px', height: '11px', background: theme.border, borderRadius: '6px' }} />
        <div style={{ width: '100px', height: '9px', background: theme.border, borderRadius: '6px' }} />
      </div>
    </div>
    {/* Content lines */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '20px' }}>
      <div style={{ width: '100%', height: '11px', background: theme.border, borderRadius: '6px' }} />
      <div style={{ width: '90%', height: '11px', background: theme.border, borderRadius: '6px' }} />
      <div style={{ width: '70%', height: '11px', background: theme.border, borderRadius: '6px' }} />
    </div>
    {/* Image placeholder */}
    <div style={{ width: '100%', height: '280px', background: theme.border, borderRadius: '14px', marginBottom: '20px' }} />
    {/* Action bar */}
    <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: `1px solid ${theme.border}` }}>
      <div style={{ width: '80px', height: '32px', background: theme.border, borderRadius: '100px' }} />
      <div style={{ width: '100px', height: '32px', background: theme.border, borderRadius: '100px' }} />
    </div>
  </div>
)

const SkeletonComments = ({ theme }) => (
  <div style={{
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '20px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(90deg, transparent 0%, ${theme.border}50 50%, transparent 100%)`,
      animation: 'shimmer 1.4s infinite',
    }} />
    <div style={{ width: '120px', height: '12px', background: theme.border, borderRadius: '6px', marginBottom: '20px' }} />
    {[1, 2, 3].map(i => (
      <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: theme.border, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px', paddingTop: '4px' }}>
          <div style={{ width: '110px', height: '9px', background: theme.border, borderRadius: '5px' }} />
          <div style={{ width: '80%', height: '9px', background: theme.border, borderRadius: '5px' }} />
        </div>
      </div>
    ))}
  </div>
)

// ─── Main component ───────────────────────────────────────────────────────────

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
  const [likeHovered, setLikeHovered] = useState(false)
  const [deleteHovered, setDeleteHovered] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await getSinglePost(id)
        setPost(res.data.post)
        setLikesCount(res.data.post.likes_count)
      } catch {
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
    } catch {
      // silent
    } finally {
      setLikeLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    try {
      await deletePost(id)
      navigate('/home')
    } catch {
      // silent
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

  // ── Loading state ──
  if (loading) {
    return (
      <>
        <style>{`
          @keyframes shimmer {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
        <div style={{ minHeight: '100vh', backgroundColor: theme.bg, fontFamily: theme.font }}>
          <Navbar />
          <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', paddingTop: '64px' }}>
            <LeftSidebar />
            <main style={{ flex: 1, marginLeft: '260px', padding: '32px 24px', maxWidth: '720px' }}>
              {/* Back button skeleton */}
              <div style={{
                width: '80px', height: '36px', background: theme.card,
                borderRadius: '10px', border: `1px solid ${theme.border}`,
                marginBottom: '24px',
              }} />
              <SkeletonPost theme={theme} />
              <SkeletonComments theme={theme} />
            </main>
          </div>
        </div>
      </>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: theme.bg,
        fontFamily: theme.font, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          textAlign: 'center',
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: '20px',
          padding: '60px 48px',
        }}>
          <WarningIcon color={theme.textMuted} />
          <p style={{
            color: theme.text, fontSize: '1.05rem',
            fontWeight: '700', margin: '20px 0 8px',
          }}>
            {error}
          </p>
          <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: '0 0 24px' }}>
            This post may have been deleted or doesn't exist
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: theme.accentMuted,
              border: `1px solid ${theme.accentBorder}`,
              color: theme.accentText,
              borderRadius: '100px',
              padding: '9px 22px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: theme.font,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
            }}
          >
            <BackIcon color={theme.accentText} />
            Go back
          </button>
        </div>
      </div>
    )
  }

  const likeActive   = liked || likeHovered
  const likeColor    = likeActive ? theme.danger : theme.textMuted
  const likeBg       = likeActive ? theme.dangerMuted : 'transparent'

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        backgroundColor: theme.bg,
        fontFamily: theme.font,
        color: theme.text,
      }}>
        <Navbar />

        <div style={{
          display: 'flex',
          maxWidth: '1400px',
          margin: '0 auto',
          paddingTop: '64px',
        }}>
          <LeftSidebar />

          <main style={{
            flex: 1,
            marginLeft: '260px',
            padding: '32px 24px',
            maxWidth: '720px',
            minHeight: 'calc(100vh - 64px)',
            animation: 'fadeIn 0.3s ease',
          }}>

            {/* ── Back button ── */}
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: theme.card,
                border: `1px solid ${theme.border}`,
                color: theme.textSecondary,
                borderRadius: '10px',
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontFamily: theme.font,
                marginBottom: '24px',
                transition: 'all 0.2s',
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
              <BackIcon color="currentColor" />
              Back
            </button>

            {/* ── Post card ── */}
            <div style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '16px',
            }}>

              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <Link
                  to={`/profile/${post?.users?.username}`}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  {post?.users?.profile_picture ? (
                    <img
                      src={post.users.profile_picture}
                      alt={post.users.name}
                      style={{
                        width: '48px', height: '48px',
                        borderRadius: '50%', objectFit: 'cover',
                        border: `1.5px solid ${theme.border}`,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: theme.avatarGradient, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: '700', fontSize: '18px',
                    }}>
                      {post?.users?.name
                        ? post.users.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                        : '?'}
                    </div>
                  )}
                  <div>
                    <p style={{
                      color: theme.text, fontWeight: '700',
                      fontSize: '0.95rem', margin: '0 0 2px',
                    }}>
                      {post?.users?.name}
                    </p>
                    <p style={{ color: theme.textMuted, fontSize: '0.8rem', margin: 0 }}>
                      @{post?.users?.username} · {timeAgo(post?.created_at)}
                    </p>
                  </div>
                </Link>

                {user?.id === post?.user_id && (
                  <button
                    onClick={handleDelete}
                    onMouseEnter={() => setDeleteHovered(true)}
                    onMouseLeave={() => setDeleteHovered(false)}
                    style={{
                      background: deleteHovered ? theme.dangerMuted : 'transparent',
                      border: `1px solid ${deleteHovered ? theme.dangerBorder : 'transparent'}`,
                      color: deleteHovered ? theme.danger : theme.textMuted,
                      cursor: 'pointer',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontFamily: theme.font,
                      transition: 'all 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      flexShrink: 0,
                    }}
                  >
                    <TrashIcon color="currentColor" />
                    Delete
                  </button>
                )}
              </div>

              {/* Content */}
              {post?.content && (
                <p style={{
                  color: theme.text,
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  margin: '0 0 16px',
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
                    marginBottom: post?.video_url ? '12px' : '0',
                    display: 'block',
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
                    display: 'block',
                  }}
                />
              )}

              {/* ── Actions ── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                paddingTop: '16px',
                marginTop: (post?.image_url || post?.video_url) ? '16px' : '0',
                borderTop: `1px solid ${theme.border}`,
              }}>

                {/* Like */}
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  onMouseEnter={() => setLikeHovered(true)}
                  onMouseLeave={() => setLikeHovered(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 16px',
                    borderRadius: '100px',
                    border: 'none',
                    background: likeBg,
                    color: likeColor,
                    fontSize: '0.875rem',
                    cursor: likeLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: theme.font,
                    fontWeight: '500',
                    opacity: likeLoading ? 0.7 : 1,
                  }}
                >
                  <HeartIcon filled={liked} color={likeColor} />
                  <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
                </button>

                {/* Comments (static display) */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 16px',
                  color: theme.textMuted,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}>
                  <CommentIcon color={theme.textMuted} />
                  <span>{post?.comments_count || 0} {post?.comments_count === 1 ? 'comment' : 'comments'}</span>
                </div>

              </div>
            </div>

            {/* ── Comments section ── */}
            <div style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '24px',
            }}>
              <CommentSection postId={id} />
            </div>

          </main>
        </div>
      </div>
    </>
  )
}

export default PostDetails