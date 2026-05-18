import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import PostCard from '../components/PostCard'
import UserCard from '../components/UserCard'
import { useTheme } from '../context/ThemeContext'
import { searchAll } from '../api/axios'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const SearchIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" stroke={color} strokeWidth="1.3" />
    <path d="M10.5 10.5l3 3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const UsersIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <circle cx="5" cy="4" r="2.5" stroke={color} strokeWidth="1.2" />
    <path d="M1 11c0-2.21 1.79-4 4-4" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="10" cy="4" r="1.8" stroke={color} strokeWidth="1.2" />
    <path d="M7.5 11c0-1.38 1.12-2.5 2.5-2.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

const PostIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke={color} strokeWidth="1.2" />
    <path d="M4 5h6M4 7.5h6M4 10h4" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

const ImageIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke={color} strokeWidth="1.2" />
    <circle cx="5" cy="5" r="1.2" stroke={color} strokeWidth="1.1" />
    <path d="M1.5 9.5l3-3 2.5 2.5 1.5-1.5 3 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const VideoIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="1" y="2.5" width="8.5" height="9" rx="1.5" stroke={color} strokeWidth="1.2" />
    <path d="M9.5 5.5l3.5-2v7l-3.5-2v-3z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
)

const SpinnerIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true"
    style={{ animation: 'spin 0.8s linear infinite' }}>
    <circle cx="7" cy="7" r="5" stroke={color} strokeWidth="1.5" strokeDasharray="10 20" />
  </svg>
)

const EmptySearchIcon = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true"
    style={{ display: 'block', margin: '0 auto', opacity: 0.2 }}>
    <circle cx="21" cy="21" r="13" stroke={color} strokeWidth="2" />
    <path d="M31 31l10 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const NoResultsIcon = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true"
    style={{ display: 'block', margin: '0 auto', opacity: 0.2 }}>
    <circle cx="21" cy="21" r="13" stroke={color} strokeWidth="2" />
    <path d="M31 31l10 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 21h10M21 16v10" stroke={color} strokeWidth="2" strokeLinecap="round"
      style={{ transform: 'rotate(45deg)', transformOrigin: '21px 21px' }} />
  </svg>
)

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'all',    label: 'All',    Icon: SearchIcon },
  { key: 'users',  label: 'Users',  Icon: UsersIcon },
  { key: 'posts',  label: 'Posts',  Icon: PostIcon },
  { key: 'images', label: 'Images', Icon: ImageIcon },
  { key: 'videos', label: 'Videos', Icon: VideoIcon },
]

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const SkeletonRow = ({ theme }) => (
  <div style={{
    height: '72px',
    background: theme.card,
    borderRadius: '14px',
    border: `1px solid ${theme.border}`,
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(90deg, transparent 0%, ${theme.border}40 50%, transparent 100%)`,
      animation: 'shimmer 1.4s infinite',
    }} />
    <div style={{
      position: 'absolute', top: '50%', left: '16px',
      transform: 'translateY(-50%)',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: theme.border }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        <div style={{ width: '130px', height: '10px', background: theme.border, borderRadius: '5px' }} />
        <div style={{ width: '90px', height: '8px', background: theme.border, borderRadius: '5px' }} />
      </div>
    </div>
  </div>
)

const SkeletonPost = ({ theme }) => (
  <div style={{
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '16px',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(90deg, transparent 0%, ${theme.border}40 50%, transparent 100%)`,
      animation: 'shimmer 1.4s infinite',
    }} />
    <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: theme.border, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ width: '140px', height: '10px', background: theme.border, borderRadius: '5px' }} />
        <div style={{ width: '100px', height: '8px', background: theme.border, borderRadius: '5px' }} />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ width: '100%', height: '10px', background: theme.border, borderRadius: '5px' }} />
      <div style={{ width: '85%', height: '10px', background: theme.border, borderRadius: '5px' }} />
      <div style={{ width: '60%', height: '10px', background: theme.border, borderRadius: '5px' }} />
    </div>
  </div>
)

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader = ({ label, count, Icon, theme }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  }}>
    <div style={{
      width: '28px', height: '28px', borderRadius: '8px',
      background: theme.accentMuted,
      border: `1px solid ${theme.accentBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={13} color={theme.accentText} />
    </div>
    <h3 style={{
      color: theme.text,
      fontSize: '0.9rem',
      fontWeight: '700',
      margin: 0,
    }}>
      {label}
    </h3>
    <span style={{
      background: theme.accentMuted,
      border: `1px solid ${theme.accentBorder}`,
      color: theme.accentText,
      fontSize: '0.68rem',
      fontWeight: '700',
      padding: '2px 9px',
      borderRadius: '100px',
      letterSpacing: '0.02em',
    }}>
      {count}
    </span>
  </div>
)

// ─── Main component ───────────────────────────────────────────────────────────

const Search = () => {
  const { theme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState('all')
  const [results, setResults] = useState({ users: [], posts: [] })
  const [loading, setLoading] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      runSearch(q, activeTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const runSearch = async (q, type) => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const res = await searchAll(q.trim(), type)
      setResults({
        users: res.data.users || [],
        posts: res.data.posts || [],
      })
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (query.trim()) runSearch(query, tab)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
      runSearch(query, activeTab)
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults({ users: [], posts: [] })
    inputRef.current?.focus()
  }

  const handlePostDeleted = (postId) => {
    setResults(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== postId) }))
  }

  const hasResults = query.trim() && (results.users.length > 0 || results.posts.length > 0)
  const noResults  = query.trim() && !loading && results.users.length === 0 && results.posts.length === 0
  const isEmpty    = !query.trim()

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
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
          }}>

            {/* ── Page header ── */}
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{
                color: theme.text,
                fontSize: '1.5rem',
                fontWeight: '800',
                margin: '0 0 4px',
                letterSpacing: '-0.5px',
              }}>
                Search
              </h1>
              <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
                Find people, posts, images and videos across ConnectHub
              </p>
            </div>

            {/* ── Search input ── */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: theme.card,
                border: `1px solid ${inputFocused ? theme.accent : theme.border}`,
                borderRadius: '14px',
                padding: '4px 4px 4px 16px',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: inputFocused ? `0 0 0 3px ${theme.accentMuted}` : 'none',
              }}>
                <SearchIcon
                  size={16}
                  color={inputFocused ? theme.accent : theme.textMuted}
                />

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Search users, posts…"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: theme.text,
                    fontSize: '0.95rem',
                    outline: 'none',
                    fontFamily: theme.font,
                    padding: '10px 0',
                    minWidth: 0,
                  }}
                />

                {/* Clear button */}
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    style={{
                      background: theme.surface,
                      border: `1px solid ${theme.border}`,
                      color: theme.textMuted,
                      borderRadius: '8px',
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = theme.text
                      e.currentTarget.style.borderColor = theme.borderHover
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = theme.textMuted
                      e.currentTarget.style.borderColor = theme.border
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!query.trim()}
                  style={{
                    background: query.trim()
                      ? `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`
                      : theme.surface,
                    color: query.trim() ? '#fff' : theme.textMuted,
                    border: `1px solid ${query.trim() ? 'transparent' : theme.border}`,
                    borderRadius: '10px',
                    padding: '9px 20px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: query.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: theme.font,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    flexShrink: 0,
                    letterSpacing: '0.01em',
                  }}
                >
                  {loading ? (
                    <SpinnerIcon size={13} color={query.trim() ? '#fff' : theme.textMuted} />
                  ) : (
                    <SearchIcon size={13} color={query.trim() ? '#fff' : theme.textMuted} />
                  )}
                  Search
                </button>
              </div>
            </form>

            {/* ── Filter tabs ── */}
            <div style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '24px',
              paddingBottom: '20px',
              borderBottom: `1px solid ${theme.border}`,
              overflowX: 'auto',
              // hide scrollbar
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}>
              {TABS.map(({ key, label, Icon }) => {
                const active = activeTab === key
                return (
                  <button
                    key={key}
                    onClick={() => handleTabChange(key)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '100px',
                      border: active
                        ? `1px solid ${theme.accentBorder}`
                        : `1px solid ${theme.border}`,
                      background: active ? theme.accentMuted : 'transparent',
                      color: active ? theme.accentText : theme.textMuted,
                      fontSize: '0.82rem',
                      fontWeight: active ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                      fontFamily: theme.font,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.borderColor = theme.borderHover
                        e.currentTarget.style.color = theme.textSecondary
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.borderColor = theme.border
                        e.currentTarget.style.color = theme.textMuted
                      }
                    }}
                  >
                    <Icon size={13} color={active ? theme.accentText : theme.textMuted} />
                    {label}
                  </button>
                )
              })}
            </div>

            {/* ── States ── */}

            {/* Empty — no query yet */}
            {isEmpty && (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                background: theme.card,
                borderRadius: '20px',
                border: `1px solid ${theme.border}`,
                animation: 'fadeIn 0.3s ease',
              }}>
                <EmptySearchIcon color={theme.textMuted} />
                <h3 style={{
                  color: theme.text,
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  margin: '20px 0 8px',
                }}>
                  Search ConnectHub
                </h3>
                <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: '0 0 24px' }}>
                  Find people, posts, images and videos
                </p>

                {/* Hint chips */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  justifyContent: 'center',
                }}>
                  {['People you may know', 'Latest posts', 'Photos', 'Videos'].map(hint => (
                    <span
                      key={hint}
                      style={{
                        background: theme.surface,
                        border: `1px solid ${theme.border}`,
                        color: theme.textMuted,
                        fontSize: '0.78rem',
                        padding: '5px 12px',
                        borderRadius: '100px',
                      }}
                    >
                      {hint}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                animation: 'fadeIn 0.2s ease',
              }}>
                {(activeTab === 'all' || activeTab === 'users') && (
                  <>
                    <div style={{
                      color: theme.textHint,
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      marginBottom: '4px',
                    }}>
                      Users
                    </div>
                    {[1, 2].map(i => <SkeletonRow key={i} theme={theme} />)}
                  </>
                )}
                {(activeTab === 'all' || activeTab === 'posts' || activeTab === 'images' || activeTab === 'videos') && (
                  <>
                    <div style={{
                      color: theme.textHint,
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      margin: '16px 0 4px',
                    }}>
                      Posts
                    </div>
                    {[1, 2].map(i => <SkeletonPost key={i} theme={theme} />)}
                  </>
                )}
              </div>
            )}

            {/* No results */}
            {noResults && (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                background: theme.card,
                borderRadius: '20px',
                border: `1px solid ${theme.border}`,
                animation: 'fadeIn 0.3s ease',
              }}>
                <NoResultsIcon color={theme.textMuted} />
                <h3 style={{
                  color: theme.text,
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  margin: '20px 0 8px',
                }}>
                  No results for &ldquo;{query}&rdquo;
                </h3>
                <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: '0 0 20px' }}>
                  Try different keywords or check the spelling
                </p>
                <button
                  onClick={handleClear}
                  style={{
                    background: theme.accentMuted,
                    border: `1px solid ${theme.accentBorder}`,
                    color: theme.accentText,
                    borderRadius: '100px',
                    padding: '8px 20px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: theme.font,
                  }}
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Results */}
            {!loading && hasResults && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '28px',
                animation: 'fadeIn 0.3s ease',
              }}>

                {/* Users section */}
                {results.users.length > 0 && (activeTab === 'all' || activeTab === 'users') && (
                  <div>
                    <SectionHeader
                      label="Users"
                      count={results.users.length}
                      Icon={UsersIcon}
                      theme={theme}
                    />
                    <div style={{
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      padding: '6px',
                    }}>
                      {results.users.map((u, i) => (
                        <div key={u.id}>
                          <UserCard user={u} />
                          {i < results.users.length - 1 && (
                            <div style={{
                              height: '1px',
                              background: theme.border,
                              margin: '0 12px',
                              opacity: 0.5,
                            }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posts section */}
                {results.posts.length > 0 && (activeTab !== 'users') && (
                  <div>
                    <SectionHeader
                      label={
                        activeTab === 'images' ? 'Images' :
                        activeTab === 'videos' ? 'Videos' :
                        'Posts'
                      }
                      count={results.posts.length}
                      Icon={
                        activeTab === 'images' ? ImageIcon :
                        activeTab === 'videos' ? VideoIcon :
                        PostIcon
                      }
                      theme={theme}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {results.posts.map(post => (
                        <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary footer */}
                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  color: theme.textHint,
                  fontSize: '0.75rem',
                }}>
                  {results.users.length + results.posts.length} result{results.users.length + results.posts.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  )
}

export default Search