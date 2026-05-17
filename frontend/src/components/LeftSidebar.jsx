import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const LeftSidebar = () => {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/explore', label: 'Explore', icon: '🔥' },
    { path: `/profile/${user?.username}`, label: 'Profile', icon: '👤' },
    { path: '/search', label: 'Search', icon: '🔍' },
    { path: '/settings', label: 'Settings', icon: '🎨' },
  ]

  return (
    <aside style={{
      position: 'fixed', left: 0, top: '64px',
      width: '260px', height: 'calc(100vh - 64px)',
      background: theme.surface,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', padding: '20px 16px',
      overflowY: 'auto', fontFamily: theme.font
    }}>

      {/* Profile card */}
      <Link to={`/profile/${user?.username}`} style={{ textDecoration: 'none', marginBottom: '24px' }}>
        <div style={{
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: '16px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s'
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = theme.borderHover
            e.currentTarget.style.borderColor = theme.borderHover
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = theme.card
            e.currentTarget.style.borderColor = theme.border
          }}
        >
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt={user.name} style={{
                width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover',
                border: `2px solid ${theme.accentBorder}`
              }} />
            ) : (
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                background: theme.avatarGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '18px', fontWeight: '700'
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{
                color: theme.text, fontWeight: '600', fontSize: '0.9rem',
                margin: '0 0 2px', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {user?.name}
              </p>
              <p style={{ color: theme.textMuted, fontSize: '0.78rem', margin: 0 }}>
                @{user?.username}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', borderTop: `1px solid ${theme.border}`,
            paddingTop: '12px'
          }}>
            {[
              { val: user?.followers_count || 0, label: 'Followers' },
              { val: user?.following_count || 0, label: 'Following' },
              { val: user?.posts_count || 0, label: 'Posts' },
            ].map(({ val, label }, i) => (
              <div key={label} style={{
                flex: 1, textAlign: 'center',
                borderRight: i < 2 ? `1px solid ${theme.border}` : 'none'
              }}>
                <div style={{ color: theme.text, fontWeight: '700', fontSize: '1rem' }}>
                  {val}
                </div>
                <div style={{ color: theme.textHint, fontSize: '0.68rem', marginTop: '1px' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Link>

      {/* Nav links */}
      <nav style={{ flex: 1 }}>
        <p style={{
          color: theme.textHint, fontSize: '0.68rem', fontWeight: '700',
          letterSpacing: '1px', textTransform: 'uppercase',
          marginBottom: '8px', padding: '0 8px'
        }}>
          Menu
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navLinks.map(({ path, label, icon }) => (
            <Link key={path} to={path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '12px',
                background: isActive(path) ? theme.accentMuted : 'transparent',
                border: isActive(path)
                  ? `1px solid ${theme.accentBorder}`
                  : '1px solid transparent',
                color: isActive(path) ? theme.accentText : theme.textMuted,
                fontSize: '0.9rem',
                fontWeight: isActive(path) ? '600' : '500',
                transition: 'all 0.2s', cursor: 'pointer'
              }}
                onMouseEnter={e => {
                  if (!isActive(path)) {
                    e.currentTarget.style.background = theme.card
                    e.currentTarget.style.color = theme.text
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(path)) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = theme.textMuted
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{icon}</span>
                <span>{label}</span>
                {isActive(path) && (
                  <div style={{
                    marginLeft: 'auto', width: '6px', height: '6px',
                    borderRadius: '50%', background: theme.accent
                  }} />
                )}
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom actions */}
      <div style={{
        marginTop: 'auto', paddingTop: '16px',
        borderTop: `1px solid ${theme.border}`
      }}>
        <Link to="/profile/edit" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '11px 14px', borderRadius: '12px',
            color: theme.textMuted, fontSize: '0.875rem',
            fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = theme.card
              e.currentTarget.style.color = theme.text
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = theme.textMuted
            }}
          >
            <span style={{ fontSize: '18px' }}>⚙️</span>
            <span>Edit Profile</span>
          </div>
        </Link>

        <div onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '11px 14px', borderRadius: '12px',
          color: theme.danger, fontSize: '0.875rem',
          fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = theme.dangerMuted}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '18px' }}>🚪</span>
          <span>Logout</span>
        </div>
      </div>
    </aside>
  )
}

export default LeftSidebar