import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import RightSidebar from '../components/RightSidebar'
import PostCard from '../components/PostCard'
import { useTheme } from '../context/ThemeContext'
import { getAllPosts } from '../api/axios'

const Explore = () => {
  const { theme } = useTheme()
  const [posts, setPosts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { key: 'all', label: '✦ All' },
    { key: 'image', label: '🖼️ Images' },
    { key: 'video', label: '🎥 Videos' },
    { key: 'text', label: '📝 Text' },
  ]

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await getAllPosts()
        setPosts(res.data.posts)
        setFiltered(res.data.posts)
      } catch (err) {
        setError('Failed to load posts')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  useEffect(() => {
    let result = posts
    if (activeTab !== 'all') {
      result = result.filter(p => p.post_type === activeTab || p.post_type === 'mixed')
    }
    if (searchQuery.trim()) {
      result = result.filter(p =>
        p.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFiltered(result)
  }, [activeTab, posts, searchQuery])

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
    setFiltered(prev => prev.filter(p => p.id !== postId))
  }

  const getCountForTab = (key) => {
    if (key === 'all') return posts.length
    return posts.filter(p => p.post_type === key || p.post_type === 'mixed').length
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
          marginRight: '300px',
          padding: '28px 24px',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {/* Page header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div>
                <h1 style={{
                  color: theme.text,
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  margin: '0 0 4px',
                  letterSpacing: '-0.5px'
                }}>
                  🔥 Explore
                </h1>
                <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
                  Discover trending posts from the community
                </p>
              </div>

              {/* Post count badge */}
              <div style={{
                background: theme.accentMuted,
                border: `1px solid ${theme.accentBorder}`,
                borderRadius: '12px',
                padding: '10px 16px',
                textAlign: 'center',
                flexShrink: 0
              }}>
                <p style={{
                  color: theme.accent,
                  fontSize: '1.1rem',
                  fontWeight: '800',
                  margin: '0 0 1px'
                }}>
                  {posts.length}
                </p>
                <p style={{
                  color: theme.textHint,
                  fontSize: '0.68rem',
                  fontWeight: '600',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Posts
                </p>
              </div>
            </div>

            {/* Search within explore */}
            <div style={{ position: 'relative', marginTop: '16px' }}>
              <span style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.textMuted,
                fontSize: '14px'
              }}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search within explore..."
                style={{
                  width: '100%',
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                  borderRadius: '12px',
                  padding: '12px 40px 12px 42px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: theme.font,
                  transition: 'all 0.2s'
                }}
                onFocus={e => {
                  e.target.style.borderColor = theme.accent
                  e.target.style.boxShadow = `0 0 0 3px ${theme.accentMuted}`
                }}
                onBlur={e => {
                  e.target.style.borderColor = theme.border
                  e.target.style.boxShadow = 'none'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: theme.border,
                    border: 'none',
                    color: theme.textMuted,
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: `1px solid ${theme.border}`,
            overflowX: 'auto'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '100px',
                  border: activeTab === tab.key
                    ? `1px solid ${theme.accentBorder}`
                    : `1px solid ${theme.border}`,
                  background: activeTab === tab.key ? theme.accentMuted : theme.card,
                  color: activeTab === tab.key ? theme.accentText : theme.textMuted,
                  fontSize: '0.85rem',
                  fontWeight: activeTab === tab.key ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: theme.font,
                  whiteSpace: 'nowrap',
                  boxShadow: activeTab === tab.key
                    ? `0 0 0 3px ${theme.accentMuted}`
                    : 'none'
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.borderColor = theme.borderHover
                    e.currentTarget.style.color = theme.textSecondary
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.borderColor = theme.border
                    e.currentTarget.style.color = theme.textMuted
                  }
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  background: activeTab === tab.key
                    ? theme.accentBorder
                    : theme.border,
                  color: activeTab === tab.key ? theme.accentText : theme.textMuted,
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '1px 7px',
                  borderRadius: '100px'
                }}>
                  {getCountForTab(tab.key)}
                </span>
              </button>
            ))}
          </div>

          {/* Results info */}
          {!loading && (
            <div style={{
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <p style={{ color: theme.textHint, fontSize: '0.8rem', margin: 0 }}>
                {searchQuery
                  ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${searchQuery}"`
                  : `${filtered.length} post${filtered.length !== 1 ? 's' : ''}`}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: theme.textHint, fontSize: '0.72rem' }}>Sort by:</span>
                <span style={{
                  color: theme.accentText,
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  background: theme.accentMuted,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.accentBorder}`
                }}>
                  🔥 Trending
                </span>
              </div>
            </div>
          )}

          {/* Posts */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4].map(i => (
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
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
              <p style={{
                color: theme.danger,
                fontWeight: '600',
                margin: '0 0 12px'
              }}>
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: theme.dangerMuted,
                  border: `1px solid ${theme.dangerBorder}`,
                  color: theme.danger,
                  borderRadius: '10px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontFamily: theme.font,
                  fontSize: '0.85rem'
                }}
              >
                Try Again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: theme.card,
              borderRadius: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                {searchQuery ? '🔍' : '📭'}
              </div>
              <h3 style={{
                color: theme.text,
                fontSize: '1.1rem',
                fontWeight: '700',
                margin: '0 0 8px'
              }}>
                {searchQuery ? `No results for "${searchQuery}"` : 'No posts yet'}
              </h3>
              <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
                {searchQuery ? 'Try a different search term' : 'Be the first to post something!'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    marginTop: '16px',
                    background: theme.accentMuted,
                    border: `1px solid ${theme.accentBorder}`,
                    color: theme.accentText,
                    borderRadius: '10px',
                    padding: '8px 18px',
                    cursor: 'pointer',
                    fontFamily: theme.font,
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filtered.map(post => (
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

export default Explore