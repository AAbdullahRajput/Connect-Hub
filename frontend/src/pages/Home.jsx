import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import RightSidebar from '../components/RightSidebar'
import CreatePost from '../components/CreatePost'
import PostCard from '../components/PostCard'
import { useTheme } from '../context/ThemeContext'
import { getFeedPosts } from '../api/axios'
import { onPostCreated, removeSocketListeners } from '../socket/socket'

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
          marginRight: '300px',
          padding: '28px 24px',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {/* Page header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              color: theme.text,
              fontSize: '1.5rem',
              fontWeight: '800',
              margin: '0 0 4px',
              letterSpacing: '-0.5px'
            }}>
              Home Feed
            </h1>
            <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
              Latest posts from people you follow
            </p>
          </div>

          <CreatePost onPostCreated={handlePostCreated} />

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: '200px',
                  background: theme.card,
                  borderRadius: '20px',
                  border: `1px solid ${theme.border}`
                }} />
              ))}
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: theme.card,
              borderRadius: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
              <p style={{ color: theme.danger, fontWeight: '600' }}>{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: theme.card,
              borderRadius: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌍</div>
              <h3 style={{
                color: theme.text,
                fontSize: '1.2rem',
                fontWeight: '700',
                margin: '0 0 8px'
              }}>
                Your feed is empty
              </h3>
              <p style={{ color: theme.textMuted, fontSize: '0.9rem', margin: 0 }}>
                Follow some users to see their posts here
              </p>
            </div>
          ) : (
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