import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  const isActive = (path) => location.pathname === path

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/search?q=${searchVal.trim()}`)
    }
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '64px', backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: '16px',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>

      {/* Logo */}
      <Link to="/home" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '800', color: '#fff'
          }}>C</div>
          <span style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
            Connect<span style={{ color: '#2563EB' }}>Hub</span>
          </span>
        </div>
      </Link>

      {/* Search bar */}
      <div style={{ flex: 1, maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
        <span style={{
          position: 'absolute', left: '14px', top: '50%',
          transform: 'translateY(-50%)', color: '#52525b', fontSize: '14px'
        }}>🔍</span>
        <input
          type="text"
          placeholder="Search ConnectHub..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onKeyDown={handleSearch}
          onFocus={() => navigate('/search')}
          style={{
            width: '100%', background: '#18181b',
            border: '1px solid #27272a', color: '#fff',
            borderRadius: '100px', padding: '9px 16px 9px 38px',
            fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
            fontFamily: 'inherit', transition: 'border-color 0.2s'
          }}
          onMouseEnter={e => e.target.style.borderColor = '#3f3f46'}
          onMouseLeave={e => e.target.style.borderColor = '#27272a'}
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
              background: isActive(path) ? 'rgba(37,99,235,0.15)' : 'transparent',
              border: isActive(path) ? '1px solid rgba(37,99,235,0.25)' : '1px solid transparent',
              color: isActive(path) ? '#60a5fa' : '#71717a',
              fontSize: '0.875rem', fontWeight: '500', transition: 'all 0.2s',
              cursor: 'pointer'
            }}
              onMouseEnter={e => { if (!isActive(path)) { e.currentTarget.style.background = '#18181b'; e.currentTarget.style.color = '#fff' }}}
              onMouseLeave={e => { if (!isActive(path)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a' }}}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Avatar + dropdown */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#18181b', border: '1px solid #27272a',
          borderRadius: '100px', padding: '4px 12px 4px 4px',
          cursor: 'pointer', transition: 'all 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#3f3f46'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#27272a'}
        >
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt={user.name}
              style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '13px', fontWeight: '700'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span style={{ color: '#d4d4d8', fontSize: '0.85rem', fontWeight: '500' }}>
            {user?.name?.split(' ')[0]}
          </span>
          <span style={{ color: '#52525b', fontSize: '10px' }}>▼</span>
        </button>

        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{
              position: 'fixed', inset: 0, zIndex: 10
            }} />
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '220px', background: '#18181b',
              border: '1px solid #27272a', borderRadius: '14px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 20,
              overflow: 'hidden'
            }}>
              {/* User info */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #27272a' }}>
                <p style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem', margin: '0 0 2px' }}>
                  {user?.name}
                </p>
                <p style={{ color: '#52525b', fontSize: '0.78rem', margin: 0 }}>
                  @{user?.username}
                </p>
              </div>

              {[
                { label: '👤 View Profile', path: `/profile/${user?.username}` },
                { label: '⚙️ Edit Profile', path: '/profile/edit' },
                { label: '🔍 Search', path: '/search' },
              ].map(({ label, path }) => (
                <Link key={path} to={path} style={{ textDecoration: 'none' }}
                  onClick={() => setMenuOpen(false)}>
                  <div style={{
                    padding: '11px 16px', color: '#a1a1aa',
                    fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#27272a'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa' }}
                  >{label}</div>
                </Link>
              ))}

              <div style={{ borderTop: '1px solid #27272a' }}>
                <div onClick={logout} style={{
                  padding: '11px 16px', color: '#f87171',
                  fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
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