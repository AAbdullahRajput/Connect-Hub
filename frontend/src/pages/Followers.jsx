import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import UserCard from '../components/UserCard'
import { useTheme } from '../context/ThemeContext'
import { getFollowers, getFollowing } from '../api/axios'

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
          getFollowing(userId)
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
          minHeight: 'calc(100vh - 64px)',
          maxWidth: '680px'
        }}>

          {/* Back + Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '28px'
          }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                color: theme.textSecondary,
                borderRadius: '10px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontFamily: theme.font,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {profileUser?.profile_picture ? (
                <img
                  src={profileUser.profile_picture}
                  alt={profileUser.name}
                  style={{
                    width: '40px', height: '40px',
                    borderRadius: '50%', objectFit: 'cover',
                    border: `2px solid ${theme.accentBorder}`
                  }}
                />
              ) : (
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: theme.avatarGradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: '700', fontSize: '16px'
                }}>
                  {username?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <h1 style={{
                  color: theme.text,
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  margin: '0 0 1px',
                  letterSpacing: '-0.3px'
                }}>
                  {profileUser?.name || username}
                </h1>
                <p style={{ color: theme.textMuted, fontSize: '0.82rem', margin: 0 }}>
                  @{username}
                </p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {[
              { label: 'Followers', count: followers.length, tab: 'followers' },
              { label: 'Following', count: following.length, tab: 'following' },
            ].map(({ label, count, tab }) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  background: activeTab === tab ? theme.accentMuted : theme.card,
                  border: `1px solid ${activeTab === tab ? theme.accentBorder : theme.border}`,
                  borderRadius: '14px',
                  padding: '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === tab
                    ? `0 0 0 3px ${theme.accentMuted}`
                    : 'none'
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.borderColor = theme.borderHover
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.borderColor = theme.border
                  }
                }}
              >
                <p style={{
                  color: activeTab === tab ? theme.accent : theme.text,
                  fontSize: '1.6rem',
                  fontWeight: '800',
                  margin: '0 0 3px',
                  letterSpacing: '-0.5px'
                }}>
                  {count}
                </p>
                <p style={{
                  color: activeTab === tab ? theme.accentText : theme.textMuted,
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px'
                }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div style={{
            display: 'flex',
            borderBottom: `2px solid ${theme.border}`,
            marginBottom: '20px'
          }}>
            {[
              { key: 'followers', label: 'Followers', count: followers.length },
              { key: 'following', label: 'Following', count: following.length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === key
                    ? `2px solid ${theme.accent}`
                    : '2px solid transparent',
                  marginBottom: '-2px',
                  color: activeTab === key ? theme.accent : theme.textMuted,
                  fontSize: '0.9rem',
                  fontWeight: activeTab === key ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: theme.font,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={e => {
                  if (activeTab !== key) e.currentTarget.style.color = theme.textSecondary
                }}
                onMouseLeave={e => {
                  if (activeTab !== key) e.currentTarget.style.color = theme.textMuted
                }}
              >
                {label}
                <span style={{
                  background: activeTab === key ? theme.accentMuted : theme.card,
                  border: `1px solid ${activeTab === key ? theme.accentBorder : theme.border}`,
                  color: activeTab === key ? theme.accentText : theme.textMuted,
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '100px'
                }}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: theme.dangerMuted,
              border: `1px solid ${theme.dangerBorder}`,
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>⚠️</span>
              <span style={{ color: theme.danger, fontSize: '0.875rem' }}>{error}</span>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{
                  height: '72px',
                  background: theme.card,
                  borderRadius: '14px',
                  border: `1px solid ${theme.border}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%', left: '16px',
                    transform: 'translateY(-50%)',
                    display: 'flex', alignItems: 'center', gap: '12px'
                  }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: theme.border
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ width: '120px', height: '10px', background: theme.border, borderRadius: '4px' }} />
                      <div style={{ width: '80px', height: '8px', background: theme.border, borderRadius: '4px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : list.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: theme.card,
              borderRadius: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                {activeTab === 'followers' ? '👥' : '🔍'}
              </div>
              <h3 style={{
                color: theme.text,
                fontSize: '1.1rem',
                fontWeight: '700',
                margin: '0 0 8px'
              }}>
                {activeTab === 'followers'
                  ? 'No followers yet'
                  : 'Not following anyone yet'}
              </h3>
              <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
                {activeTab === 'followers'
                  ? 'Share your profile to get your first follower!'
                  : 'Start following people to see them here'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {list.map((u) => (
                <UserCard key={u.id} user={u} />
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default Followers