import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import PostCard from '../components/PostCard'
import FollowButton from '../components/FollowButton'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getUserProfile, getAllPosts } from '../api/axios'

const Profile = () => {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [followersCount, setFollowersCount] = useState(0)

  const isOwnProfile = currentUser?.username === username

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const profileRes = await getUserProfile(username)
        setProfile(profileRes.data.user)
        setFollowersCount(profileRes.data.user.followers_count)
        const postsRes = await getAllPosts()
        const userPosts = postsRes.data.posts.filter(
          p => p.user_id === profileRes.data.user.id
        )
        setPosts(userPosts)
      } catch (err) {
        setError('User not found')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [username])

  const handleFollowChange = (isFollowing) => {
    setFollowersCount(prev => isFollowing ? prev + 1 : prev - 1)
  }

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: theme.bg, fontFamily: theme.font
      }}>
        <Navbar />
        <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', paddingTop: '64px' }}>
          <LeftSidebar />
          <main style={{ flex: 1, marginLeft: '260px', padding: '28px 24px' }}>
            <div style={{
              height: '200px', background: theme.card,
              borderRadius: '20px', border: `1px solid ${theme.border}`,
              marginBottom: '16px'
            }} />
            <div style={{
              height: '120px', background: theme.card,
              borderRadius: '20px', border: `1px solid ${theme.border}`
            }} />
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: theme.bg, fontFamily: theme.font,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <p style={{ color: theme.danger }}>{error}</p>
      </div>
    )
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
          padding: '28px 24px',
          maxWidth: '720px',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {/* Cover photo */}
          <div style={{
            position: 'relative',
            height: '200px',
            background: theme.card,
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '16px',
            border: `1px solid ${theme.border}`
          }}>
            {profile?.cover_photo ? (
              <img
  src={profile.cover_photo}
  alt="Cover"
  style={{
    width: '100%', height: '100%', objectFit: 'cover',
    objectPosition: `center ${profile.cover_position ?? 50}%`
  }}
/>
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: `linear-gradient(135deg, ${theme.accentMuted}, ${theme.surface})`
              }} />
            )}
          </div>

          {/* Profile info card */}
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '24px',
            marginTop: '-48px',
            position: 'relative'
          }}>
            {/* Avatar + actions row */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                overflow: 'hidden', marginTop: '-20px',
                border: `4px solid ${theme.card}`,
                background: theme.avatarGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '28px', fontWeight: '700', flexShrink: 0
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

              <div style={{ display: 'flex', gap: '8px' }}>
                {isOwnProfile ? (
                  <button
                    onClick={() => navigate('/profile/edit')}
                    style={{
                      padding: '8px 18px',
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      color: theme.textSecondary,
                      borderRadius: '100px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: theme.font,
                      transition: 'all 0.2s'
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
                    Edit Profile
                  </button>
                ) : (
                  <FollowButton
                    targetUserId={profile?.id}
                    onFollowChange={handleFollowChange}
                  />
                )}
              </div>
            </div>

            {/* Name */}
            <h1 style={{
              color: theme.text,
              fontSize: '1.3rem',
              fontWeight: '800',
              margin: '0 0 2px',
              letterSpacing: '-0.3px'
            }}>
              {profile?.name}
            </h1>
            <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: '0 0 12px' }}>
              @{profile?.username}
            </p>

            {/* Bio */}
            {profile?.bio && (
              <p style={{
                color: theme.textSecondary,
                fontSize: '0.9rem',
                lineHeight: '1.6',
                margin: '0 0 16px'
              }}>
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: '0',
              paddingTop: '16px',
              borderTop: `1px solid ${theme.border}`
            }}>
              {[
                { val: posts.length, label: 'Posts', link: null },
                { val: followersCount, label: 'Followers', link: `/profile/${username}/followers` },
                { val: profile?.following_count || 0, label: 'Following', link: `/profile/${username}/followers` },
              ].map(({ val, label, link }, i) => {
                const content = (
                  <div style={{
                    flex: 1, textAlign: 'center', padding: '8px 0',
                    borderRight: i < 2 ? `1px solid ${theme.border}` : 'none',
                    cursor: link ? 'pointer' : 'default',
                    transition: 'opacity 0.2s'
                  }}>
                    <p style={{
                      color: theme.text, fontWeight: '800',
                      fontSize: '1.1rem', margin: '0 0 2px'
                    }}>
                      {val}
                    </p>
                    <p style={{
                      color: theme.textMuted, fontSize: '0.72rem',
                      fontWeight: '600', margin: 0,
                      textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                      {label}
                    </p>
                  </div>
                )
                return link ? (
                  <Link key={label} to={link} style={{ flex: 1, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={label} style={{ flex: 1 }}>{content}</div>
                )
              })}
            </div>
          </div>

          {/* Posts */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{
              color: theme.text, fontSize: '1rem',
              fontWeight: '700', margin: 0
            }}>
              Posts
            </h2>
            <span style={{
              background: theme.accentMuted, border: `1px solid ${theme.accentBorder}`,
              color: theme.accentText, fontSize: '0.75rem', fontWeight: '700',
              padding: '3px 10px', borderRadius: '100px'
            }}>
              {posts.length}
            </span>
          </div>

          {posts.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: theme.card, borderRadius: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
              <p style={{ color: theme.textMuted, fontSize: '0.9rem', margin: 0 }}>
                No posts yet
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
      </div>
    </div>
  )
}

export default Profile