import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import PostCard from '../components/PostCard'
import FollowButton from '../components/FollowButton'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getUserProfile, getAllPosts, getSuggestedUsers } from '../api/axios'

const StatCard = ({ value, label, theme }) => (
  <div style={{
    background: theme.surface,
    borderRadius: '10px',
    padding: '12px 14px',
  }}>
    <p style={{
      fontSize: '1.25rem',
      fontWeight: '700',
      margin: '0 0 2px',
      color: theme.text,
      letterSpacing: '-0.5px',
    }}>{value}</p>
    <p style={{
      fontSize: '0.72rem',
      color: theme.textMuted,
      margin: 0,
      fontWeight: '500',
    }}>{label}</p>
  </div>
)

const AchievementItem = ({ icon, title, desc, earned, theme }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: earned
      ? (theme.bg === '#000' ? 'rgba(37,99,235,0.1)' : 'rgba(37,99,235,0.07)')
      : theme.surface,
    border: `1px solid ${earned
      ? 'rgba(37,99,235,0.2)'
      : (theme.border || 'rgba(255,255,255,0.08)')}`,
    opacity: earned ? 1 : 0.45,
    transition: 'opacity 0.2s',
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      background: earned
        ? 'rgba(37,99,235,0.15)'
        : (theme.surface || 'rgba(255,255,255,0.04)'),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: '15px' }}>{icon}</span>
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={{
        fontSize: '0.82rem',
        fontWeight: '600',
        margin: '0 0 1px',
        color: earned ? theme.accent : theme.textSecondary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>{title}</p>
      <p style={{
        fontSize: '0.72rem',
        color: theme.textMuted,
        margin: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>{desc}</p>
    </div>
    {earned && (
      <div style={{
        marginLeft: 'auto',
        flexShrink: 0,
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: theme.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    )}
  </div>
)

const SidebarSection = ({ title, children, theme }) => (
  <div style={{
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '16px',
    padding: '18px 20px',
  }}>
    <p style={{
      fontSize: '0.68rem',
      fontWeight: '700',
      color: theme.textMuted,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      margin: '0 0 14px',
    }}>{title}</p>
    {children}
  </div>
)

const Profile = () => {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [suggested, setSuggested] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [followersCount, setFollowersCount] = useState(0)
  const [activeTab, setActiveTab] = useState('posts')

  const isOwnProfile = currentUser?.username === username

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [profileRes, postsRes, suggestedRes] = await Promise.all([
          getUserProfile(username),
          getAllPosts(),
          getSuggestedUsers().catch(() => ({ data: { suggested_users: [] } })),
        ])

        const prof = profileRes.data.user
        setProfile(prof)
        setFollowersCount(prof.followers_count)

        const userPosts = postsRes.data.posts.filter(p => p.user_id === prof.id)
        setPosts(userPosts)

        setSuggested(
          (suggestedRes.data.suggested_users || [])
            .filter(u => u.id !== prof.id)
            .slice(0, 3)
        )
      } catch {
        setError('User not found')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [username])

  const handleFollowChange = (isFollowing) => {
    setFollowersCount(prev => isFollowing ? prev + 1 : prev - 1)
  }

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  const formatJoinDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0)
  const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0)
  const avgLikes = posts.length > 0
    ? (totalLikes / posts.length).toFixed(1)
    : '0'
  const engagementRate = posts.length > 0 && followersCount > 0
    ? Math.min(100, Math.round((totalLikes + totalComments) / (posts.length * Math.max(followersCount, 1)) * 100))
    : 0

  const achievements = [
    {
      icon: '★',
      title: 'First post',
      desc: 'Published your first post',
      earned: posts.length >= 1,
    },
    {
      icon: '▲',
      title: 'Rising creator',
      desc: 'Reached 10 followers',
      earned: followersCount >= 10,
    },
    {
      icon: '◆',
      title: 'Prolific writer',
      desc: 'Published 10 or more posts',
      earned: posts.length >= 10,
    },
    {
      icon: '●',
      title: 'Community builder',
      desc: 'Reached 100 followers',
      earned: followersCount >= 100,
    },
  ]

  const avatarColors = [
    ['#1e3a5f', '#60a5fa'],
    ['#1a3a2a', '#4ade80'],
    ['#3b1f3a', '#c084fc'],
    ['#3a1f1a', '#fb923c'],
    ['#1a2d3a', '#38bdf8'],
  ]
  const getAvatarColor = (name = '') => {
    const idx = name.charCodeAt(0) % avatarColors.length
    return avatarColors[idx]
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.bg, fontFamily: theme.font }}>
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
            padding: '28px 24px',
          }}>
            <div style={{
              height: '220px',
              background: theme.card,
              borderRadius: '20px',
              border: `1px solid ${theme.border}`,
              marginBottom: '16px',
            }} />
            <div style={{
              height: '160px',
              background: theme.card,
              borderRadius: '20px',
              border: `1px solid ${theme.border}`,
            }} />
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme.bg,
        fontFamily: theme.font,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '3rem',
            margin: '0 0 12px',
            opacity: 0.3,
          }}>—</p>
          <p style={{
            color: theme.danger,
            fontSize: '1rem',
            fontWeight: '600',
            margin: '0 0 16px',
          }}>{error}</p>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.textSecondary,
              borderRadius: '10px',
              padding: '9px 18px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontFamily: theme.font,
            }}
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

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

        {/* Center column */}
        <main style={{
          flex: 1,
          marginLeft: '260px',
          marginRight: '300px',
          padding: '28px 24px',
          minHeight: 'calc(100vh - 64px)',
        }}>

          {/* Cover photo */}
          <div style={{
            position: 'relative',
            height: '220px',
            background: theme.card,
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '16px',
            border: `1px solid ${theme.border}`,
          }}>
            {profile?.cover_photo ? (
              <img
                src={profile.cover_photo}
                alt="Cover"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: `center ${profile.cover_position ?? 50}%`,
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: theme.accentMuted || 'rgba(37,99,235,0.08)',
              }} />
            )}

            {isOwnProfile && (
              <button
                onClick={() => navigate('/profile/edit')}
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: theme.font,
                  backdropFilter: 'blur(4px)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
              >
                Edit cover
              </button>
            )}
          </div>

          {/* Profile card */}
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '20px',
            marginTop: '-52px',
            position: 'relative',
          }}>
            {/* Avatar + action buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <div style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                overflow: 'hidden',
                marginTop: '-24px',
                border: `4px solid ${theme.card}`,
                background: theme.avatarGradient || 'linear-gradient(135deg, #2563EB, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '30px',
                fontWeight: '700',
                flexShrink: 0,
                boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
              }}>
                {profile?.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt={profile.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  profile?.name?.[0]?.toUpperCase()
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {isOwnProfile ? (
                  <button
                    onClick={() => navigate('/profile/edit')}
                    style={{
                      padding: '8px 20px',
                      background: 'transparent',
                      border: `1px solid ${theme.border}`,
                      color: theme.textSecondary,
                      borderRadius: '100px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: theme.font,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = theme.accent
                      e.currentTarget.style.color = theme.accent
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = theme.border
                      e.currentTarget.style.color = theme.textSecondary
                    }}
                  >
                    Edit profile
                  </button>
                ) : (
                  <>
                    <FollowButton
                      targetUserId={profile?.id}
                      onFollowChange={handleFollowChange}
                    />
                    <button
                      style={{
                        padding: '8px 18px',
                        background: 'transparent',
                        border: `1px solid ${theme.border}`,
                        color: theme.textSecondary,
                        borderRadius: '100px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: theme.font,
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
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Name + username */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{
                  color: theme.text,
                  fontSize: '1.4rem',
                  fontWeight: '800',
                  margin: 0,
                  letterSpacing: '-0.3px',
                }}>
                  {profile?.name}
                </h1>
                {followersCount >= 10 && (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    title="Verified"
                  >
                    <circle cx="9" cy="9" r="9" fill={theme.accent || '#2563EB'} />
                    <path
                      d="M5 9l2.5 2.5L13 6.5"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <p style={{
                color: theme.textMuted,
                fontSize: '0.875rem',
                margin: '3px 0 0',
              }}>
                @{profile?.username}
              </p>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p style={{
                color: theme.textSecondary,
                fontSize: '0.9rem',
                lineHeight: '1.65',
                margin: '0 0 12px',
              }}>
                {profile.bio}
              </p>
            )}

            {/* Meta row */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '18px',
            }}>
              {profile?.location && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: theme.textMuted,
                  fontSize: '0.82rem',
                }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 1a3.5 3.5 0 0 1 3.5 3.5c0 2.5-3.5 7.5-3.5 7.5S3 7 3 4.5A3.5 3.5 0 0 1 6.5 1z" stroke="currentColor" strokeWidth="1.1" fill="none"/>
                    <circle cx="6.5" cy="4.5" r="1.2" fill="currentColor"/>
                  </svg>
                  {profile.location}
                </span>
              )}
              {profile?.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: theme.accent,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    fontWeight: '500',
                  }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1"/>
                    <path d="M1 6.5h11M6.5 1c-1.5 2-1.5 8 0 11M6.5 1c1.5 2 1.5 8 0 11" stroke="currentColor" strokeWidth="1.1"/>
                  </svg>
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {profile?.created_at && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: theme.textMuted,
                  fontSize: '0.82rem',
                }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <rect x="1" y="2" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.1"/>
                    <path d="M1 5.5h11M4.5 1v2M8.5 1v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                  Joined {formatJoinDate(profile.created_at)}
                </span>
              )}
            </div>

            {/* Stats row */}
            <div style={{
              display: 'flex',
              gap: '0',
              paddingTop: '16px',
              borderTop: `1px solid ${theme.border}`,
            }}>
              {[
                { val: posts.length, label: 'Posts', link: null },
                { val: followersCount, label: 'Followers', link: `/profile/${username}/followers` },
                { val: profile?.following_count || 0, label: 'Following', link: `/profile/${username}/followers` },
              ].map(({ val, label, link }, i) => {
                const inner = (
                  <div style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '10px 0',
                    borderRight: i < 2 ? `1px solid ${theme.border}` : 'none',
                    transition: 'opacity 0.2s',
                  }}>
                    <p style={{
                      color: theme.text,
                      fontWeight: '800',
                      fontSize: '1.15rem',
                      margin: '0 0 2px',
                      letterSpacing: '-0.3px',
                    }}>{val.toLocaleString()}</p>
                    <p style={{
                      color: theme.textMuted,
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>{label}</p>
                  </div>
                )
                return link ? (
                  <Link
                    key={label}
                    to={link}
                    style={{ flex: 1, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={label} style={{ flex: 1 }}>{inner}</div>
                )
              })}
            </div>
          </div>

          {/* Posts tab header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.border}`,
            marginBottom: '20px',
          }}>
            {['posts', 'liked'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab
                    ? `2px solid ${theme.accent}`
                    : '2px solid transparent',
                  color: activeTab === tab ? theme.text : theme.textMuted,
                  fontSize: '0.875rem',
                  fontWeight: activeTab === tab ? '700' : '500',
                  cursor: 'pointer',
                  fontFamily: theme.font,
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                  letterSpacing: '0.01em',
                }}
              >
                {tab === 'posts' ? `Posts (${posts.length})` : 'Liked'}
              </button>
            ))}
          </div>

          {/* Posts list */}
          {activeTab === 'posts' && (
            posts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 20px',
                background: theme.card,
                borderRadius: '20px',
                border: `1px solid ${theme.border}`,
              }}>
                <p style={{
                  color: theme.textMuted,
                  fontSize: '0.9rem',
                  margin: 0,
                }}>No posts yet</p>
                {isOwnProfile && (
                  <p style={{
                    color: theme.textMuted,
                    fontSize: '0.82rem',
                    margin: '6px 0 0',
                    opacity: 0.7,
                  }}>Share something to get started</p>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
                ))}
              </div>
            )
          )}

          {activeTab === 'liked' && (
            <div style={{
              textAlign: 'center',
              padding: '64px 20px',
              background: theme.card,
              borderRadius: '20px',
              border: `1px solid ${theme.border}`,
            }}>
              <p style={{
                color: theme.textMuted,
                fontSize: '0.9rem',
                margin: 0,
              }}>Liked posts coming soon</p>
            </div>
          )}
        </main>

        {/* Right sidebar */}
        <aside style={{
          position: 'fixed',
          right: 0,
          top: '64px',
          width: '280px',
          height: 'calc(100vh - 64px)',
          borderLeft: `1px solid ${theme.border}`,
          background: theme.card,
          padding: '20px 16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontFamily: theme.font,
        }}>

          {/* Engagement stats */}
          <SidebarSection title="Stats" theme={theme}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}>
              <StatCard
                value={totalLikes.toLocaleString()}
                label="Total likes"
                theme={theme}
              />
              <StatCard
                value={totalComments.toLocaleString()}
                label="Total comments"
                theme={theme}
              />
              <StatCard
                value={avgLikes}
                label="Avg likes / post"
                theme={theme}
              />
              <StatCard
                value={`${engagementRate}%`}
                label="Engagement rate"
                theme={theme}
              />
            </div>
          </SidebarSection>

          {/* Achievements */}
          <SidebarSection title="Achievements" theme={theme}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {achievements.map(a => (
                <AchievementItem
                  key={a.title}
                  icon={a.icon}
                  title={a.title}
                  desc={a.desc}
                  earned={a.earned}
                  theme={theme}
                />
              ))}
            </div>
          </SidebarSection>

          {/* Similar accounts */}
          {suggested.length > 0 && (
            <SidebarSection title="Similar accounts" theme={theme}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {suggested.map(u => {
                  const [bg, fg] = getAvatarColor(u.name)
                  return (
                    <div
                      key={u.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                      <Link
                        to={`/profile/${u.username}`}
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}
                      >
                        {u.profile_picture ? (
                          <img
                            src={u.profile_picture}
                            alt={u.name}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: fg,
                            fontSize: '13px',
                            fontWeight: '700',
                            flexShrink: 0,
                          }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            fontSize: '0.82rem',
                            fontWeight: '600',
                            margin: '0 0 1px',
                            color: theme.text,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>{u.name}</p>
                          <p style={{
                            fontSize: '0.72rem',
                            color: theme.textMuted,
                            margin: 0,
                          }}>
                            @{u.username}
                            {u.followers_count > 0 && ` · ${u.followers_count} followers`}
                          </p>
                        </div>
                      </Link>
                      <FollowButton targetUserId={u.id} />
                    </div>
                  )
                })}
              </div>
            </SidebarSection>
          )}

          {/* Joined date footer */}
          {profile?.created_at && (
            <p style={{
              fontSize: '0.72rem',
              color: theme.textMuted,
              margin: '4px 0 0',
              opacity: 0.5,
              textAlign: 'center',
            }}>
              Member since {formatJoinDate(profile.created_at)}
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}

export default Profile