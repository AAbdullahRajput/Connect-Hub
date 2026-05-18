import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'
import ThemeSwitcher from './ThemeSwitcher'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const SearchIcon = ({ color = 'currentColor', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="5" stroke={color} strokeWidth="1.4" />
    <path d="M11.5 11.5l3.5 3.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const HomeIcon = ({ color = 'currentColor', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <path d="M2 7.5L8.5 2 15 7.5V15a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M6 16v-5h5v5" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
)

const ExploreIcon = ({ color = 'currentColor', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="6.5" stroke={color} strokeWidth="1.3" />
    <path d="M11 6l-2 5-3-3 5-2z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
)

const ProfileIcon = ({ color = 'currentColor', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <circle cx="8.5" cy="6" r="3" stroke={color} strokeWidth="1.3" />
    <path d="M2.5 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const ChevronIcon = ({ color = 'currentColor', size = 10, up = false }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden="true"
    style={{ transform: up ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
    <path d="M2 3.5l3 3 3-3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ViewProfileIcon = ({ color = 'currentColor', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <circle cx="8.5" cy="6" r="3" stroke={color} strokeWidth="1.3" />
    <path d="M2.5 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const EditProfileIcon = ({ color = 'currentColor', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M11 2l3 3-9 9H2v-3l9-9z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
)

const SettingsIcon = ({ color = 'currentColor', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="2.2" stroke={color} strokeWidth="1.2" />
    <path d="M8.5 1.5v2M8.5 13.5v2M1.5 8.5h2M13.5 8.5h2M3.4 3.4l1.4 1.4M12.2 12.2l1.4 1.4M3.4 13.6l1.4-1.4M12.2 4.8l1.4-1.4"
      stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

const SearchMenuIcon = ({ color = 'currentColor', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="5" stroke={color} strokeWidth="1.3" />
    <path d="M11.5 11.5l3.5 3.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const LogoutIcon = ({ color = 'currentColor', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M11 11l3-3-3-3M14 8H6" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Theme indicator icons (small colored dots, no emojis)
const ThemeDotIcon = ({ color, size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true">
    <circle cx="5" cy="5" r="4.5" fill={color} />
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────

const THEME_DOTS = {
  midnight: '#2563EB',
  parchment: '#7c3aed',
  forest:   '#16a34a',
  aurora:   '#ec4899',
}

const NAV_LINKS = (username) => [
  { path: '/home',               label: 'Home',    Icon: HomeIcon    },
  { path: '/explore',            label: 'Explore', Icon: ExploreIcon },
  { path: `/profile/${username}`,label: 'Profile', Icon: ProfileIcon },
]

const MENU_ITEMS = (username) => [
  { label: 'View Profile', path: `/profile/${username}`, Icon: ViewProfileIcon },
  { label: 'Edit Profile', path: '/profile/edit',        Icon: EditProfileIcon },
  { label: 'Settings',     path: '/settings',             Icon: SettingsIcon   },
  { label: 'Search',       path: '/search',               Icon: SearchMenuIcon },
]

// ─────────────────────────────────────────────────────────────────────────────

const Navbar = () => {
  const { user, logout } = useAuth()
  const { theme, themeName } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  const isActive = (path) => location.pathname === path

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/search?q=${searchVal.trim()}`)
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '64px',
      backgroundColor: theme.navbarBg,
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${theme.border}`,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: '16px',
      fontFamily: theme.font,
    }}>

      {/* ── Logo ── */}
      <Link to="/home" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '800', color: '#fff',
            boxShadow: `0 4px 12px ${theme.accentMuted}`,
          }}>C</div>
          <span style={{ color: theme.text, fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
            Connect<span style={{ color: theme.accent }}>Hub</span>
          </span>
        </div>
      </Link>

      {/* ── Search bar ── */}
      <div style={{ flex: 1, maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
        <span style={{
          position: 'absolute', left: '14px', top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center',
          color: theme.textMuted, pointerEvents: 'none',
        }}>
          <SearchIcon size={15} />
        </span>
        <input
          type="text"
          placeholder="Search ConnectHub..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onKeyDown={handleSearch}
          onFocus={() => navigate('/search')}
          style={{
            width: '100%', background: theme.card,
            border: `1px solid ${theme.border}`, color: theme.text,
            borderRadius: '100px', padding: '9px 16px 9px 38px',
            fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
            fontFamily: theme.font, transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = theme.accent}
          onBlur={e => e.target.style.borderColor = theme.border}
        />
      </div>

      {/* ── Nav links ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        {NAV_LINKS(user?.username).map(({ path, label, Icon }) => {
          const active = isActive(path)
          return (
            <Link key={path} to={path} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '10px',
                  background: active ? theme.accentMuted : 'transparent',
                  border: active ? `1px solid ${theme.accentBorder}` : '1px solid transparent',
                  color: active ? theme.accentText : theme.textMuted,
                  fontSize: '0.875rem', fontWeight: '500',
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
                <Icon color="currentColor" size={15} />
                <span>{label}</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── Theme toggle ── */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => { setThemeOpen(!themeOpen); setMenuOpen(false) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            background: themeOpen ? theme.accentMuted : theme.card,
            border: `1px solid ${themeOpen ? theme.accentBorder : theme.border}`,
            borderRadius: '100px', padding: '7px 14px',
            cursor: 'pointer', fontFamily: theme.font, transition: 'all 0.2s',
            color: themeOpen ? theme.accentText : theme.textSecondary,
            fontSize: '0.8rem', fontWeight: '600',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = theme.accentBorder
            e.currentTarget.style.color = theme.accentText
            e.currentTarget.style.background = theme.accentMuted
          }}
          onMouseLeave={e => {
            if (!themeOpen) {
              e.currentTarget.style.borderColor = theme.border
              e.currentTarget.style.color = theme.textSecondary
              e.currentTarget.style.background = theme.card
            }
          }}
        >
          <ThemeDotIcon color={THEME_DOTS[themeName] || theme.accent} size={10} />
          <span>{themeName.charAt(0).toUpperCase() + themeName.slice(1)}</span>
          <ChevronIcon color="currentColor" size={10} up={themeOpen} />
        </button>

        {themeOpen && (
          <>
            <div onClick={() => setThemeOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              zIndex: 20, width: '230px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              borderRadius: '16px', overflow: 'hidden',
            }}>
              <ThemeSwitcher />
            </div>
          </>
        )}
      </div>

      {/* ── Avatar + dropdown ── */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => { setMenuOpen(!menuOpen); setThemeOpen(false) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: theme.card, border: `1px solid ${theme.border}`,
            borderRadius: '100px', padding: '4px 10px 4px 4px',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = theme.borderHover}
          onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.borderColor = theme.border }}
        >
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.name}
              style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: theme.avatarGradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '12px', fontWeight: '700',
            }}>
              {initials}
            </div>
          )}
          <span style={{ color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '500' }}>
            {user?.name?.split(' ')[0]}
          </span>
          <ChevronIcon color={theme.textMuted} size={10} up={menuOpen} />
        </button>

        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '220px', background: theme.card,
              border: `1px solid ${theme.border}`, borderRadius: '14px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 20,
              overflow: 'hidden',
            }}>
              {/* User info header */}
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}` }}>
                <p style={{ color: theme.text, fontWeight: '600', fontSize: '0.9rem', margin: '0 0 2px' }}>
                  {user?.name}
                </p>
                <p style={{ color: theme.textMuted, fontSize: '0.78rem', margin: 0 }}>
                  @{user?.username}
                </p>
              </div>

              {/* Menu items */}
              {MENU_ITEMS(user?.username).map(({ label, path, Icon }) => (
                <Link key={path} to={path} style={{ textDecoration: 'none' }}
                  onClick={() => setMenuOpen(false)}>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '11px 16px', color: theme.textSecondary,
                      fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = theme.surface
                      e.currentTarget.style.color = theme.text
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = theme.textSecondary
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <Icon color="currentColor" size={15} />
                    </span>
                    {label}
                  </div>
                </Link>
              ))}

              {/* Logout */}
              <div style={{ borderTop: `1px solid ${theme.border}` }}>
                <div
                  onClick={logout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '11px 16px', color: theme.danger,
                    fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.dangerMuted}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: theme.danger }}>
                    <LogoutIcon color="currentColor" size={15} />
                  </span>
                  Log out
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar