import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import RightSidebar from '../components/RightSidebar'
import CreatePost from '../components/CreatePost'
import PostCard from '../components/PostCard'
import { useTheme } from '../context/ThemeContext'
import { getFeedPosts } from '../api/axios'
import { onPostCreated, removeSocketListeners } from '../socket/socket'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const WarningIcon = ({ color = 'currentColor', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const EmptyFeedIcon = ({ color = 'currentColor', size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="1.5" />
    <path d="M16 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="18" cy="22" r="1.5" fill={color} />
    <circle cx="30" cy="22" r="1.5" fill={color} />
    <path d="M17 32c1.5-2 4-3 7-3s5.5 1 7 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 36l4-4M40 36l-4-4" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────

const Home = () => {
  const { theme } = useTheme()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await getFeedPosts()
        setPosts(res.data.posts)
      } catch (err) {
        setError('Failed to load feed')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
    onPostCreated((newPost) => setPosts(prev => [newPost, ...prev]))
    return () => removeSocketListeners()
  }, [])

  const handlePostCreated = (newPost) => setPosts(prev => [newPost, ...prev])
  const handlePostDeleted = (postId) => setPosts(prev => prev.filter(p => p.id !== postId))

  return (
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
          marginRight: '300px',
          padding: '28px 24px',
          minHeight: 'calc(100vh - 64px)',
        }}>

          {/* Page header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              color: theme.text, fontSize: '1.5rem',
              fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.5px',
            }}>
              Home Feed
            </h1>
            <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
              Latest posts from people you follow
            </p>
          </div>

          <CreatePost onPostCreated={handlePostCreated} />

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: '200px', background: theme.card,
                  borderRadius: '20px', border: `1px solid ${theme.border}`,
                }} />
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: theme.card, borderRadius: '20px',
              border: `1px solid ${theme.border}`,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'center',
                marginBottom: '16px', color: theme.danger,
              }}>
                <WarningIcon color={theme.danger} size={36} />
              </div>
              <p style={{ color: theme.danger, fontWeight: '600', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && posts.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              background: theme.card, borderRadius: '20px',
              border: `1px solid ${theme.border}`,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'center',
                marginBottom: '20px', color: theme.textHint,
              }}>
                <EmptyFeedIcon color={theme.textHint} size={52} />
              </div>
              <h3 style={{
                color: theme.text, fontSize: '1.2rem',
                fontWeight: '700', margin: '0 0 8px',
              }}>
                Your feed is empty
              </h3>
              <p style={{ color: theme.textMuted, fontSize: '0.9rem', margin: 0 }}>
                Follow some users to see their posts here
              </p>
            </div>
          )}

          {/* Posts */}
          {!loading && !error && posts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {posts.map(post => (
                <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
              ))}
            </div>
          )}

        </main>

        <RightSidebar />
      </div>
    </div>
  )
}

export default Home