import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
 
// ─── SVG Icons ────────────────────────────────────────────────────────────────
 
const HomeIcon = ({ color, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <path d="M2 7.5L8.5 2 15 7.5V15a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M6 16v-5h5v5" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
)
 
const ExploreIcon = ({ color, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="6.5" stroke={color} strokeWidth="1.3" />
    <path d="M11 6l-2 5-3-3 5-2z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
)
 
const ProfileIcon = ({ color, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <circle cx="8.5" cy="6" r="3" stroke={color} strokeWidth="1.3" />
    <path d="M2.5 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)
 
const SearchIcon = ({ color, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="5" stroke={color} strokeWidth="1.3" />
    <path d="M11.5 11.5l3.5 3.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)
 
const SettingsIcon = ({ color, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="2.2" stroke={color} strokeWidth="1.2" />
    <path d="M8.5 1.5v2M8.5 13.5v2M1.5 8.5h2M13.5 8.5h2M3.4 3.4l1.4 1.4M12.2 12.2l1.4 1.4M3.4 13.6l1.4-1.4M12.2 4.8l1.4-1.4" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)
 
const EditIcon = ({ color, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M11 2l3 3-9 9H2v-3l9-9z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
)
 
const LogoutIcon = ({ color, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M11 11l3-3-3-3M14 8H6" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
 
// ─── Nav link config ──────────────────────────────────────────────────────────
 
const NAV_LINKS = (username) => [
  { path: '/home',             label: 'Home',     Icon: HomeIcon    },
  { path: '/explore',          label: 'Explore',  Icon: ExploreIcon },
  { path: `/profile/${username}`, label: 'Profile', Icon: ProfileIcon },
  { path: '/search',           label: 'Search',   Icon: SearchIcon  },
  { path: '/settings',         label: 'Settings', Icon: SettingsIcon },
]
 
// ─── Component ────────────────────────────────────────────────────────────────
 
const LeftSidebar = () => {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const isActive = (path) => location.pathname === path
 
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
 
  return (
    <aside style={{
      position: 'fixed', left: 0, top: '64px',
      width: '260px', height: 'calc(100vh - 64px)',
      background: theme.surface,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column',
      padding: '20px 16px',
      overflowY: 'auto', fontFamily: theme.font,
    }}>
 
      {/* ── Profile card ── */}
      <Link to={`/profile/${user?.username}`} style={{ textDecoration: 'none', marginBottom: '24px' }}>
        <div
          style={{
            background: theme.card, border: `1px solid ${theme.border}`,
            borderRadius: '16px', padding: '16px',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = theme.borderHover
            e.currentTarget.style.background = theme.surface
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = theme.border
            e.currentTarget.style.background = theme.card
          }}
        >
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                style={{
                  width: '44px', height: '44px',
                  borderRadius: '50%', objectFit: 'cover',
                  border: `1.5px solid ${theme.border}`,
                  flexShrink: 0, display: 'block',
                }}
              />
            ) : (
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                background: theme.avatarGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '17px', fontWeight: '700',
                letterSpacing: '0.02em',
              }}>
                {initials}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{
                color: theme.text, fontWeight: '600', fontSize: '0.9rem',
                margin: '0 0 2px', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.name}
              </p>
              <p style={{ color: theme.textMuted, fontSize: '0.78rem', margin: 0 }}>
                @{user?.username}
              </p>
            </div>
          </div>
 
          {/* Stats */}
          <div style={{
            display: 'flex',
            borderTop: `1px solid ${theme.border}`,
            paddingTop: '12px',
          }}>
            {[
              { val: user?.followers_count || 0, label: 'Followers' },
              { val: user?.following_count || 0, label: 'Following' },
              { val: user?.posts_count     || 0, label: 'Posts'     },
            ].map(({ val, label }, i) => (
              <div key={label} style={{
                flex: 1, textAlign: 'center',
                borderRight: i < 2 ? `1px solid ${theme.border}` : 'none',
              }}>
                <div style={{ color: theme.text, fontWeight: '700', fontSize: '1rem' }}>
                  {val}
                </div>
                <div style={{ color: theme.textHint, fontSize: '0.67rem', marginTop: '1px' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Link>
 
      {/* ── Nav links ── */}
      <nav style={{ flex: 1 }}>
        <p style={{
          color: theme.textHint, fontSize: '0.67rem', fontWeight: '700',
          letterSpacing: '1px', textTransform: 'uppercase',
          marginBottom: '8px', padding: '0 8px', margin: '0 0 8px',
        }}>
          Menu
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_LINKS(user?.username).map(({ path, label, Icon }) => {
            const active = isActive(path)
            return (
              <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '11px 14px', borderRadius: '12px',
                    background: active ? theme.accentMuted : 'transparent',
                    border: active ? `1px solid ${theme.accentBorder}` : '1px solid transparent',
                    color: active ? theme.accentText : theme.textMuted,
                    fontSize: '0.875rem',
                    fontWeight: active ? '600' : '500',
                    transition: 'all 0.2s', cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = theme.card
                      e.currentTarget.style.color = theme.text
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = theme.textMuted
                    }
                  }}
                >
                  <Icon color="currentColor" size={17} />
                  <span>{label}</span>
                  {active && (
                    <div style={{
                      marginLeft: 'auto',
                      width: '6px', height: '6px',
                      borderRadius: '50%',
                      background: theme.accent,
                    }} />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
 
      {/* ── Bottom actions ── */}
      <div style={{
        marginTop: 'auto', paddingTop: '16px',
        borderTop: `1px solid ${theme.border}`,
      }}>
        <Link to="/profile/edit" style={{ textDecoration: 'none' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 14px', borderRadius: '12px',
              color: theme.textMuted, fontSize: '0.875rem',
              fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s',
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
            <EditIcon color="currentColor" size={16} />
            <span>Edit Profile</span>
          </div>
        </Link>
 
        <div
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '11px 14px', borderRadius: '12px',
            color: theme.danger, fontSize: '0.875rem',
            fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = theme.dangerMuted}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogoutIcon color="currentColor" size={16} />
          <span>Log out</span>
        </div>
      </div>
    </aside>
  )
}
 
export default LeftSidebar