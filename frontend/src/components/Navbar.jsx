import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'
import ThemeSwitcher from './ThemeSwitcher'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { theme, themeName } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  const isActive = (path) => location.pathname === path

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/search?q=${searchVal.trim()}`)
    }
  }

  const themeIcons = {
    midnight: '🌙',
    parchment: '📜',
    forest: '🌲',
    aurora: '🌸',
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '64px', backgroundColor: theme.navbarBg,
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${theme.border}`,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: '16px',
      fontFamily: theme.font
    }}>

      {/* Logo */}
      <Link to="/home" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '800', color: '#fff',
            boxShadow: `0 4px 12px ${theme.accentMuted}`
          }}>C</div>
          <span style={{ color: theme.text, fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
            Connect<span style={{ color: theme.accent }}>Hub</span>
          </span>
        </div>
      </Link>

      {/* Search bar */}
      <div style={{ flex: 1, maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
        <span style={{
          position: 'absolute', left: '14px', top: '50%',
          transform: 'translateY(-50%)', color: theme.textMuted, fontSize: '14px'
        }}>🔍</span>
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
            fontFamily: theme.font, transition: 'border-color 0.2s'
          }}
          onMouseEnter={e => e.target.style.borderColor = theme.borderHover}
          onMouseLeave={e => e.target.style.borderColor = theme.border}
        />
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        {[
          { path: '/home', label: 'Home', icon: '🏠' },
          { path: '/explore', label: 'Explore', icon: '🔥' },
          { path: `/profile/${user?.username}`, label: 'Profile', icon: '👤' },
        ].map(({ path, label, icon }) => (
          <Link key={path} to={path} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '10px',
              background: isActive(path) ? theme.accentMuted : 'transparent',
              border: isActive(path) ? `1px solid ${theme.accentBorder}` : '1px solid transparent',
              color: isActive(path) ? theme.accentText : theme.textMuted,
              fontSize: '0.875rem', fontWeight: '500', transition: 'all 0.2s',
              cursor: 'pointer'
            }}
              onMouseEnter={e => { if (!isActive(path)) { e.currentTarget.style.background = theme.card; e.currentTarget.style.color = theme.text }}}
              onMouseLeave={e => { if (!isActive(path)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textMuted }}}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Theme toggle button */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => { setThemeOpen(!themeOpen); setMenuOpen(false) }}
          title="Switch theme"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: themeOpen ? theme.accentMuted : theme.card,
            border: `1px solid ${themeOpen ? theme.accentBorder : theme.border}`,
            borderRadius: '100px', padding: '6px 14px',
            cursor: 'pointer', fontFamily: theme.font,
            transition: 'all 0.2s', color: themeOpen ? theme.accentText : theme.textSecondary,
            fontSize: '0.8rem', fontWeight: '600'
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
          <span style={{ fontSize: '16px' }}>{themeIcons[themeName]}</span>
          <span>{themeName.charAt(0).toUpperCase() + themeName.slice(1)}</span>
          <span style={{ fontSize: '10px', opacity: 0.6 }}>{themeOpen ? '▲' : '▼'}</span>
        </button>

        {/* Theme dropdown */}
        {themeOpen && (
          <>
            <div onClick={() => setThemeOpen(false)} style={{
              position: 'fixed', inset: 0, zIndex: 10
            }} />
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              zIndex: 20, width: '230px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              borderRadius: '16px', overflow: 'hidden'
            }}>
              <ThemeSwitcher />
            </div>
          </>
        )}
      </div>

      {/* Avatar + dropdown */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button onClick={() => { setMenuOpen(!menuOpen); setThemeOpen(false) }} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: '100px', padding: '4px 12px 4px 4px',
          cursor: 'pointer', transition: 'all 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = theme.borderHover}
          onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}
        >
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt={user.name}
              style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: theme.avatarGradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '13px', fontWeight: '700'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span style={{ color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '500' }}>
            {user?.name?.split(' ')[0]}
          </span>
          <span style={{ color: theme.textMuted, fontSize: '10px' }}>▼</span>
        </button>

        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{
              position: 'fixed', inset: 0, zIndex: 10
            }} />
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '220px', background: theme.card,
              border: `1px solid ${theme.border}`, borderRadius: '14px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 20,
              overflow: 'hidden'
            }}>
              {/* User info */}
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}` }}>
                <p style={{ color: theme.text, fontWeight: '600', fontSize: '0.9rem', margin: '0 0 2px' }}>
                  {user?.name}
                </p>
                <p style={{ color: theme.textMuted, fontSize: '0.78rem', margin: 0 }}>
                  @{user?.username}
                </p>
              </div>

              {[
                { label: '👤 View Profile', path: `/profile/${user?.username}` },
                { label: '⚙️ Edit Profile', path: '/profile/edit' },
                { label: '🎨 Settings', path: '/settings' },
                { label: '🔍 Search', path: '/search' },
              ].map(({ label, path }) => (
                <Link key={path} to={path} style={{ textDecoration: 'none' }}
                  onClick={() => setMenuOpen(false)}>
                  <div style={{
                    padding: '11px 16px', color: theme.textSecondary,
                    fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = theme.surface; e.currentTarget.style.color = theme.text }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textSecondary }}
                  >{label}</div>
                </Link>
              ))}

              <div style={{ borderTop: `1px solid ${theme.border}` }}>
                <div onClick={logout} style={{
                  padding: '11px 16px', color: theme.danger,
                  fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.dangerMuted}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  🚪 Logout
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