import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LeftSidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/explore', label: 'Explore', icon: '🔥' },
    { path: `/profile/${user?.username}`, label: 'Profile', icon: '👤' },
    { path: '/search', label: 'Search', icon: '🔍' },
  ]

  return (
    <aside style={{
      position: 'fixed', left: 0, top: '64px',
      width: '260px', height: 'calc(100vh - 64px)',
      background: '#09090b', borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', padding: '20px 16px',
      overflowY: 'auto', fontFamily: "'Inter', system-ui, sans-serif"
    }}>

      {/* Profile card */}
      <Link to={`/profile/${user?.username}`} style={{ textDecoration: 'none', marginBottom: '24px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt={user.name} style={{
                width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover',
                border: '2px solid rgba(37,99,235,0.4)'
              }} />
            ) : (
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '18px', fontWeight: '700'
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </p>
              <p style={{ color: '#52525b', fontSize: '0.78rem', margin: 0 }}>
                @{user?.username}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
            {[
              { val: user?.followers_count || 0, label: 'Followers' },
              { val: user?.following_count || 0, label: 'Following' },
              { val: user?.posts_count || 0, label: 'Posts' },
            ].map(({ val, label }, i) => (
              <div key={label} style={{
                flex: 1, textAlign: 'center',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none'
              }}>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '1rem' }}>{val}</div>
                <div style={{ color: '#3f3f50', fontSize: '0.68rem', marginTop: '1px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <p style={{ color: '#3f3f50', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', padding: '0 8px' }}>
          Menu
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navLinks.map(({ path, label, icon }) => (
            <Link key={path} to={path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '12px',
                background: isActive(path) ? 'rgba(37,99,235,0.15)' : 'transparent',
                border: isActive(path) ? '1px solid rgba(37,99,235,0.2)' : '1px solid transparent',
                color: isActive(path) ? '#60a5fa' : '#71717a',
                fontSize: '0.9rem', fontWeight: isActive(path) ? '600' : '500',
                transition: 'all 0.2s', cursor: 'pointer'
              }}
                onMouseEnter={e => { if (!isActive(path)) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff' }}}
                onMouseLeave={e => { if (!isActive(path)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a' }}}
              >
                <span style={{ fontSize: '18px' }}>{icon}</span>
                <span>{label}</span>
                {isActive(path) && (
                  <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB' }} />
                )}
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom actions */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Link to="/profile/edit" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '11px 14px', borderRadius: '12px', color: '#71717a',
            fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a' }}
          >
            <span style={{ fontSize: '18px' }}>⚙️</span>
            <span>Edit Profile</span>
          </div>
        </Link>
        <div onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '11px 14px', borderRadius: '12px', color: '#f87171',
          fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <span style={{ fontSize: '18px' }}>🚪</span>
          <span>Logout</span>
        </div>
      </div>
    </aside>
  )
}

export default LeftSidebar