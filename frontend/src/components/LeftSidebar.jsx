import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// ── SVG icon set ──────────────────────────────────────────────────────────────
const HomeIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const ExploreIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const ProfileIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const SearchIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const SettingsIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

const EditIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const LogoutIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const ActiveDotIcon = () => (
  <svg width="6" height="6" viewBox="0 0 6 6">
    <circle cx="3" cy="3" r="3" fill="currentColor" />
  </svg>
)
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = (username) => [
  { path: '/home',                    label: 'Home',     Icon: HomeIcon    },
  { path: '/explore',                 label: 'Explore',  Icon: ExploreIcon },
  { path: `/profile/${username}`,     label: 'Profile',  Icon: ProfileIcon },
  { path: '/search',                  label: 'Search',   Icon: SearchIcon  },
  { path: '/settings',                label: 'Settings', Icon: SettingsIcon},
]

const LeftSidebar = () => {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const navLinks = NAV_LINKS(user?.username)

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: '64px',
      width: '260px',
      height: 'calc(100vh - 64px)',
      background: theme.surface,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 16px',
      overflowY: 'auto',
      fontFamily: theme.font,
    }}>

      {/* ── Profile card ─────────────────────────────────────────────── */}
      <Link to={`/profile/${user?.username}`} style={{ textDecoration: 'none', marginBottom: '24px' }}>
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
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
              <img
                src={user.profile_picture}
                alt={user.name}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${theme.accentBorder}`,
                  flexShrink: 0,
                }}
              />
            ) : (
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                flexShrink: 0,
                background: theme.avatarGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '18px',
                fontWeight: '700',
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{
                color: theme.text,
                fontWeight: '600',
                fontSize: '0.9rem',
                margin: '0 0 2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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
            display: 'flex',
            borderTop: `1px solid ${theme.border}`,
            paddingTop: '12px',
          }}>
            {[
              { val: user?.followers_count || 0, label: 'Followers' },
              { val: user?.following_count || 0, label: 'Following' },
              { val: user?.posts_count    || 0, label: 'Posts'     },
            ].map(({ val, label }, i) => (
              <div key={label} style={{
                flex: 1,
                textAlign: 'center',
                borderRight: i < 2 ? `1px solid ${theme.border}` : 'none',
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

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav style={{ flex: 1 }}>
        <p style={{
          color: theme.textHint,
          fontSize: '0.68rem',
          fontWeight: '700',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '8px',
          padding: '0 8px',
          margin: '0 0 8px',
        }}>
          Menu
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navLinks.map(({ path, label, Icon }) => {
            const active = isActive(path)
            return (
              <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    background: active ? theme.accentMuted : 'transparent',
                    border: active
                      ? `1px solid ${theme.accentBorder}`
                      : '1px solid transparent',
                    color: active ? theme.accentText : theme.textMuted,
                    fontSize: '0.9rem',
                    fontWeight: active ? '600' : '500',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
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
                  {/* Icon inherits the parent's current color via CSS */}
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: active ? theme.accentText : theme.textMuted,
                    flexShrink: 0,
                  }}>
                    <Icon size={20} />
                  </span>

                  <span>{label}</span>

                  {active && (
                    <span style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      color: theme.accent,
                    }}>
                      <ActiveDotIcon />
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── Bottom actions ───────────────────────────────────────────── */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '16px',
        borderTop: `1px solid ${theme.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        {/* Edit Profile */}
        <Link to="/profile/edit" style={{ textDecoration: 'none' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '12px',
              color: theme.textMuted,
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
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
            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <EditIcon size={18} />
            </span>
            <span>Edit Profile</span>
          </div>
        </Link>

        {/* Logout */}
        <div
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '11px 14px',
            borderRadius: '12px',
            color: theme.danger,
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = theme.dangerMuted}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: theme.danger }}>
            <LogoutIcon size={18} />
          </span>
          <span>Logout</span>
        </div>
      </div>
    </aside>
  )
}

export default LeftSidebar