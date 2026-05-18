import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import UserCard from '../components/UserCard'
import { useTheme } from '../context/ThemeContext'
import { getFollowers, getFollowing } from '../api/axios'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const BackIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M9 2L4 7l5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const WarningIcon = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M7.5 1.5L13.5 12.5H1.5L7.5 1.5Z"
      stroke={color} strokeWidth="1.3" strokeLinejoin="round"
    />
    <path d="M7.5 6v3.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="7.5" cy="11" r="0.6" fill={color} />
  </svg>
)

const FollowersEmptyIcon = ({ color }) => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true"
    style={{ display: 'block', margin: '0 auto', opacity: 0.18 }}>
    <circle cx="20" cy="18" r="7" stroke={color} strokeWidth="2" />
    <path d="M6 40c0-7.732 6.268-14 14-14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="36" cy="18" r="5" stroke={color} strokeWidth="2" />
    <path d="M28 40c0-5.523 4.477-10 10-10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M38 26v8M34 30h8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const FollowingEmptyIcon = ({ color }) => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true"
    style={{ display: 'block', margin: '0 auto', opacity: 0.18 }}>
    <circle cx="22" cy="20" r="8" stroke={color} strokeWidth="2" />
    <path d="M6 44c0-8.837 7.163-16 16-16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M34 30l5 5 8-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ─── Skeleton row ─────────────────────────────────────────────────────────────

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
      background: `linear-gradient(90deg, transparent 0%, ${theme.border}50 50%, transparent 100%)`,
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
        <div style={{ width: '86px', height: '8px', background: theme.border, borderRadius: '5px' }} />
      </div>
    </div>
  </div>
)

// ─── Main component ───────────────────────────────────────────────────────────

const Followers = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState('followers')
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileUser, setProfileUser] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const profileRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/${username}`
        )
        const profileData = await profileRes.json()
        const userId = profileData.user.id
        setProfileUser(profileData.user)

        const [followersRes, followingRes] = await Promise.all([
          getFollowers(userId),
          getFollowing(userId),
        ])

        setFollowers(followersRes.data.followers)
        setFollowing(followingRes.data.following)
      } catch (err) {
        setError('Failed to load data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [username])

  const list = activeTab === 'followers' ? followers : following

  const initials = profileUser?.name
    ? profileUser.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : username?.[0]?.toUpperCase() || '?'

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
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
            minHeight: 'calc(100vh - 64px)',
            maxWidth: '680px',
          }}>

            {/* ── Back + header ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '28px',
            }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  color: theme.textSecondary,
                  borderRadius: '10px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontFamily: theme.font,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                {profileUser?.profile_picture ? (
                  <img
                    src={profileUser.profile_picture}
                    alt={profileUser.name}
                    style={{
                      width: '40px', height: '40px',
                      borderRadius: '50%', objectFit: 'cover',
                      border: `1.5px solid ${theme.border}`,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: theme.avatarGradient, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: '700', fontSize: '15px',
                  }}>
                    {initials}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <h1 style={{
                    color: theme.text,
                    fontSize: '1.15rem',
                    fontWeight: '800',
                    margin: '0 0 1px',
                    letterSpacing: '-0.3px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {profileUser?.name || username}
                  </h1>
                  <p style={{ color: theme.textMuted, fontSize: '0.8rem', margin: 0 }}>
                    @{username}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Stats cards ── */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Followers', count: followers.length, tab: 'followers' },
                { label: 'Following', count: following.length, tab: 'following' },
              ].map(({ label, count, tab }) => {
                const active = activeTab === tab
                return (
                  <div
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      background: active ? theme.accentMuted : theme.card,
                      border: `1px solid ${active ? theme.accentBorder : theme.border}`,
                      borderRadius: '14px',
                      padding: '16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: active ? `0 0 0 3px ${theme.accentMuted}` : 'none',
                    }}
                    onMouseEnter={e => {
                      if (!active) e.currentTarget.style.borderColor = theme.borderHover
                    }}
                    onMouseLeave={e => {
                      if (!active) e.currentTarget.style.borderColor = theme.border
                    }}
                  >
                    <p style={{
                      color: active ? theme.accent : theme.text,
                      fontSize: '1.6rem',
                      fontWeight: '800',
                      margin: '0 0 3px',
                      letterSpacing: '-0.5px',
                    }}>
                      {count}
                    </p>
                    <p style={{
                      color: active ? theme.accentText : theme.textMuted,
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}>
                      {label}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* ── Tab bar ── */}
            <div style={{
              display: 'flex',
              borderBottom: `1px solid ${theme.border}`,
              marginBottom: '20px',
            }}>
              {[
                { key: 'followers', label: 'Followers', count: followers.length },
                { key: 'following', label: 'Following', count: following.length },
              ].map(({ key, label, count }) => {
                const active = activeTab === key
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      borderBottom: `2px solid ${active ? theme.accent : 'transparent'}`,
                      marginBottom: '-1px',
                      color: active ? theme.accent : theme.textMuted,
                      fontSize: '0.875rem',
                      fontWeight: active ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: theme.font,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={e => {
                      if (!active) e.currentTarget.style.color = theme.textSecondary
                    }}
                    onMouseLeave={e => {
                      if (!active) e.currentTarget.style.color = theme.textMuted
                    }}
                  >
                    {label}
                    <span style={{
                      background: active ? theme.accentMuted : theme.surface,
                      border: `1px solid ${active ? theme.accentBorder : theme.border}`,
                      color: active ? theme.accentText : theme.textMuted,
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '100px',
                    }}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* ── Error ── */}
            {error && (
              <div style={{
                background: theme.dangerMuted,
                border: `1px solid ${theme.dangerBorder}`,
                borderRadius: '12px',
                padding: '13px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <WarningIcon color={theme.danger} />
                <span style={{ color: theme.danger, fontSize: '0.875rem' }}>{error}</span>
              </div>
            )}

            {/* ── Loading skeletons ── */}
            {loading && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                animation: 'fadeIn 0.2s ease',
              }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <SkeletonRow key={i} theme={theme} />
                ))}
              </div>
            )}

            {/* ── Empty state ── */}
            {!loading && !error && list.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                background: theme.card,
                borderRadius: '20px',
                border: `1px solid ${theme.border}`,
                animation: 'fadeIn 0.3s ease',
              }}>
                {activeTab === 'followers'
                  ? <FollowersEmptyIcon color={theme.textMuted} />
                  : <FollowingEmptyIcon color={theme.textMuted} />
                }
                <h3 style={{
                  color: theme.text,
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  margin: '20px 0 8px',
                }}>
                  {activeTab === 'followers'
                    ? 'No followers yet'
                    : 'Not following anyone yet'}
                </h3>
                <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
                  {activeTab === 'followers'
                    ? 'Share your profile to get your first follower'
                    : 'Start following people to see them here'}
                </p>
              </div>
            )}

            {/* ── List ── */}
            {!loading && list.length > 0 && (
              <div style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: '16px',
                overflow: 'hidden',
                padding: '6px',
                animation: 'fadeIn 0.3s ease',
              }}>
                {list.map((u, i) => (
                  <div key={u.id}>
                    <UserCard user={u} />
                    {i < list.length - 1 && (
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
            )}

          </main>
        </div>
      </div>
    </>
  )
}

export default Followers