import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSuggestedUsers, searchAll } from '../api/axios'
import UserCard from './UserCard'

const RightSidebar = () => {
  const navigate = useNavigate()
  const [suggested, setSuggested] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSuggestedUsers()
      .then(res => setSuggested(res.data.suggested_users))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/search?q=${searchQuery.trim()}`)
  }

  return (
    <aside style={{
      position: 'fixed', right: 0, top: '64px',
      width: '300px', height: 'calc(100vh - 64px)',
      background: '#09090b', borderLeft: '1px solid rgba(255,255,255,0.05)',
      padding: '20px 16px', overflowY: 'auto',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)', color: '#52525b', fontSize: '14px'
          }}>🔍</span>
          <input
            type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search ConnectHub..."
            style={{
              width: '100%', background: '#18181b',
              border: '1px solid #27272a', color: '#fff',
              borderRadius: '100px', padding: '10px 16px 10px 38px',
              fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
            onFocus={e => e.target.style.borderColor = '#2563EB'}
            onBlur={e => e.target.style.borderColor = '#27272a'}
          />
        </div>
      </form>

      {/* Trending section */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: '#3f3f50', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Trending
        </p>
        {['#ConnectHub', '#Social', '#Tech', '#CodeAlpha'].map((tag, i) => (
          <div key={tag} onClick={() => navigate(`/search?q=${tag.slice(1)}`)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
            transition: 'all 0.2s', marginBottom: '2px'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div>
              <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: '600', margin: '0 0 2px' }}>{tag}</p>
              <p style={{ color: '#3f3f50', fontSize: '0.72rem', margin: 0 }}>{(i + 1) * 234} posts</p>
            </div>
            <span style={{ color: '#3f3f50', fontSize: '12px' }}>→</span>
          </div>
        ))}
      </div>

      {/* Suggested users */}
      <div>
        <p style={{ color: '#3f3f50', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Suggested for you
        </p>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                height: '60px', background: '#18181b', borderRadius: '12px',
                border: '1px solid #27272a'
              }} />
            ))}
          </div>
        ) : suggested.length === 0 ? (
          <p style={{ color: '#3f3f50', fontSize: '0.85rem' }}>No suggestions yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {suggested.map(u => <UserCard key={u.id} user={u} />)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#27272a', fontSize: '0.72rem', textAlign: 'center' }}>
          © 2024 ConnectHub · CodeAlpha Internship
        </p>
      </div>
    </aside>
  )
}

export default RightSidebar