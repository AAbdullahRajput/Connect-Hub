import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import RightSidebar from '../components/RightSidebar'
import PostCard from '../components/PostCard'
import { getAllPosts } from '../api/axios'

const Explore = () => {
  const [posts, setPosts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { key: 'all', label: '✦ All', count: null },
    { key: 'image', label: '🖼️ Images', count: null },
    { key: 'video', label: '🎥 Videos', count: null },
    { key: 'text', label: '📝 Text', count: null },
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
      minHeight: '100vh', backgroundColor: '#000',
      fontFamily: "'Inter', system-ui, sans-serif", color: '#fff'
    }}>
      <Navbar />
      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', paddingTop: '64px' }}>
        <LeftSidebar />

        <main style={{
          flex: 1, marginLeft: '260px', marginRight: '300px',
          padding: '28px 24px', minHeight: 'calc(100vh - 64px)'
        }}>

          {/* Page header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <h1 style={{
                  color: '#fff', fontSize: '1.5rem', fontWeight: '800',
                  margin: '0 0 4px', letterSpacing: '-0.5px'
                }}>
                  🔥 Explore
                </h1>
                <p style={{ color: '#52525b', fontSize: '0.875rem', margin: 0 }}>
                  Discover trending posts from the community
                </p>
              </div>

              {/* Post count badge */}
              <div style={{
                background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
                borderRadius: '12px', padding: '10px 16px', textAlign: 'center', flexShrink: 0
              }}>
                <p style={{ color: '#2563EB', fontSize: '1.1rem', fontWeight: '800', margin: '0 0 1px' }}>
                  {posts.length}
                </p>
                <p style={{ color: '#3f3f50', fontSize: '0.68rem', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Posts
                </p>
              </div>
            </div>

            {/* Search within explore */}
            <div style={{ position: 'relative', marginTop: '16px' }}>
              <span style={{
                position: 'absolute', left: '16px', top: '50%',
                transform: 'translateY(-50%)', color: '#52525b', fontSize: '14px'
              }}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search within explore..."
                style={{
                  width: '100%', background: '#18181b',
                  border: '1px solid #27272a', color: '#fff',
                  borderRadius: '12px', padding: '12px 16px 12px 42px',
                  fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'inherit', transition: 'all 0.2s'
                }}
                onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#27272a'; e.target.style.boxShadow = 'none' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)', background: '#27272a',
                  border: 'none', color: '#71717a', borderRadius: '50%',
                  width: '22px', height: '22px', cursor: 'pointer',
                  fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>✕</button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{
            display: 'flex', gap: '8px', marginBottom: '24px',
            paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            overflowX: 'auto'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '100px',
                  border: activeTab === tab.key
                    ? '1px solid rgba(37,99,235,0.4)'
                    : '1px solid #27272a',
                  background: activeTab === tab.key
                    ? 'rgba(37,99,235,0.15)'
                    : '#18181b',
                  color: activeTab === tab.key ? '#60a5fa' : '#71717a',
                  fontSize: '0.85rem', fontWeight: activeTab === tab.key ? '700' : '500',
                  cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: 'inherit', whiteSpace: 'nowrap',
                  boxShadow: activeTab === tab.key ? '0 0 0 3px rgba(37,99,235,0.08)' : 'none'
                }}
                onMouseEnter={e => { if (activeTab !== tab.key) { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.color = '#fff' }}}
                onMouseLeave={e => { if (activeTab !== tab.key) { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#71717a' }}}
              >
                <span>{tab.label}</span>
                <span style={{
                  background: activeTab === tab.key ? 'rgba(37,99,235,0.3)' : '#27272a',
                  color: activeTab === tab.key ? '#93c5fd' : '#52525b',
                  fontSize: '0.7rem', fontWeight: '700',
                  padding: '1px 7px', borderRadius: '100px'
                }}>
                  {getCountForTab(tab.key)}
                </span>
              </button>
            ))}
          </div>

          {/* Results info */}
          {!loading && (
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: '#3f3f50', fontSize: '0.8rem', margin: 0 }}>
                {searchQuery
                  ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${searchQuery}"`
                  : `${filtered.length} post${filtered.length !== 1 ? 's' : ''}`}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#3f3f50', fontSize: '0.72rem' }}>Sort by:</span>
                <span style={{
                  color: '#60a5fa', fontSize: '0.72rem', fontWeight: '600',
                  background: 'rgba(37,99,235,0.1)', padding: '3px 8px', borderRadius: '6px'
                }}>🔥 Trending</span>
              </div>
            </div>
          )}

          {/* Posts */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  height: '200px', background: '#18181b',
                  borderRadius: '20px', border: '1px solid #27272a',
                  position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
                    animation: 'shimmer 1.5s infinite'
                  }} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: '#18181b', borderRadius: '20px', border: '1px solid #27272a'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
              <p style={{ color: '#f87171', fontWeight: '600', margin: '0 0 8px' }}>{error}</p>
              <button onClick={() => window.location.reload()} style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171', borderRadius: '10px', padding: '8px 16px',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem'
              }}>
                Try Again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              background: '#18181b', borderRadius: '20px', border: '1px solid #27272a'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                {searchQuery ? '🔍' : '📭'}
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: '0 0 8px' }}>
                {searchQuery ? `No results for "${searchQuery}"` : 'No posts yet'}
              </h3>
              <p style={{ color: '#52525b', fontSize: '0.875rem', margin: 0 }}>
                {searchQuery ? 'Try a different search term' : 'Be the first to post something!'}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{
                  marginTop: '16px', background: 'rgba(37,99,235,0.1)',
                  border: '1px solid rgba(37,99,235,0.25)', color: '#60a5fa',
                  borderRadius: '10px', padding: '8px 18px', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '600'
                }}>
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