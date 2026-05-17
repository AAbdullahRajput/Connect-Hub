import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import PostCard from '../components/PostCard'
import UserCard from '../components/UserCard'
import { useTheme } from '../context/ThemeContext'
import { searchAll } from '../api/axios'

const Search = () => {
  const { theme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState('all')
  const [results, setResults] = useState({ users: [], posts: [] })
  const [loading, setLoading] = useState(false)

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'users', label: 'Users' },
    { key: 'posts', label: 'Posts' },
    { key: 'images', label: 'Images' },
    { key: 'videos', label: 'Videos' },
  ]

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      handleSearch(q)
    }
  }, [searchParams])

  const handleSearch = async (q = query, type = activeTab) => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const res = await searchAll(q.trim(), type)
      setResults({
        users: res.data.users || [],
        posts: res.data.posts || []
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (query.trim()) handleSearch(query, tab)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
      handleSearch(query)
    }
  }

  const handlePostDeleted = (postId) => {
    setResults(prev => ({
      ...prev,
      posts: prev.posts.filter(p => p.id !== postId)
    }))
  }

  const totalResults = (results.users?.length || 0) + (results.posts?.length || 0)

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
          padding: '28px 24px',
          maxWidth: '720px',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {/* Page header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              color: theme.text, fontSize: '1.5rem',
              fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.5px'
            }}>
              Search
            </h1>
            <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
              Find users, posts, images and videos
            </p>
          </div>

          {/* Search input */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '16px', top: '50%',
                  transform: 'translateY(-50%)', color: theme.textMuted, fontSize: '14px'
                }}>🔍</span>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search users, posts..."
                  style={{
                    width: '100%', background: theme.card,
                    border: `1px solid ${theme.border}`, color: theme.text,
                    borderRadius: '12px', padding: '13px 16px 13px 42px',
                    fontSize: '0.9rem', outline: 'none',
                    boxSizing: 'border-box', fontFamily: theme.font,
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
              </div>
              <button
                type="submit"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                  color: '#fff', padding: '13px 24px',
                  borderRadius: '12px', border: 'none',
                  fontSize: '0.9rem', fontWeight: '700',
                  cursor: 'pointer', fontFamily: theme.font,
                  transition: 'all 0.2s', flexShrink: 0
                }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Filter tabs */}
          <div style={{
            display: 'flex', gap: '8px', marginBottom: '20px',
            paddingBottom: '16px', borderBottom: `1px solid ${theme.border}`,
            overflowX: 'auto'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  padding: '7px 16px', borderRadius: '100px',
                  border: activeTab === tab.key
                    ? `1px solid ${theme.accentBorder}`
                    : `1px solid ${theme.border}`,
                  background: activeTab === tab.key ? theme.accentMuted : theme.card,
                  color: activeTab === tab.key ? theme.accentText : theme.textMuted,
                  fontSize: '0.85rem',
                  fontWeight: activeTab === tab.key ? '700' : '500',
                  cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: theme.font, whiteSpace: 'nowrap'
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
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: '72px', background: theme.card,
                  borderRadius: '14px', border: `1px solid ${theme.border}`
                }} />
              ))}
            </div>
          ) : !query.trim() ? (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              background: theme.card, borderRadius: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
              <h3 style={{
                color: theme.text, fontSize: '1.1rem',
                fontWeight: '700', margin: '0 0 8px'
              }}>
                Search ConnectHub
              </h3>
              <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
                Find users, posts, images and videos
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              background: theme.card, borderRadius: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
              <h3 style={{
                color: theme.text, fontSize: '1.1rem',
                fontWeight: '700', margin: '0 0 8px'
              }}>
                No results for "{query}"
              </h3>
              <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
                Try different keywords
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {results.users?.length > 0 && (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'
                  }}>
                    <h3 style={{
                      color: theme.text, fontSize: '0.95rem',
                      fontWeight: '700', margin: 0
                    }}>
                      Users
                    </h3>
                    <span style={{
                      background: theme.accentMuted, border: `1px solid ${theme.accentBorder}`,
                      color: theme.accentText, fontSize: '0.7rem', fontWeight: '700',
                      padding: '2px 8px', borderRadius: '100px'
                    }}>
                      {results.users.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {results.users.map(u => (
                      <UserCard key={u.id} user={u} />
                    ))}
                  </div>
                </div>
              )}

              {results.posts?.length > 0 && (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'
                  }}>
                    <h3 style={{
                      color: theme.text, fontSize: '0.95rem',
                      fontWeight: '700', margin: 0
                    }}>
                      Posts
                    </h3>
                    <span style={{
                      background: theme.accentMuted, border: `1px solid ${theme.accentBorder}`,
                      color: theme.accentText, fontSize: '0.7rem', fontWeight: '700',
                      padding: '2px 8px', borderRadius: '100px'
                    }}>
                      {results.posts.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {results.posts.map(post => (
                      <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default Search