import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { getSuggestedUsers } from '../api/axios'
import UserCard from './UserCard'

const RightSidebar = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
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
      background: theme.surface,
      borderLeft: `1px solid ${theme.border}`,
      padding: '20px 16px', overflowY: 'auto',
      fontFamily: theme.font
    }}>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)',
            color: theme.textMuted, fontSize: '14px'
          }}>🔍</span>
          <input
            type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search ConnectHub..."
            style={{
              width: '100%', background: theme.card,
              border: `1px solid ${theme.border}`, color: theme.text,
              borderRadius: '100px', padding: '10px 16px 10px 38px',
              fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
              fontFamily: theme.font, transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = theme.accent}
            onBlur={e => e.target.style.borderColor = theme.border}
          />
        </div>
      </form>

      {/* Trending */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{
          color: theme.textHint, fontSize: '0.68rem', fontWeight: '700',
          letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px'
        }}>
          Trending
        </p>
        {['#ConnectHub', '#Social', '#Tech', '#CodeAlpha'].map((tag, i) => (
          <div
            key={tag}
            onClick={() => navigate(`/search?q=${tag.slice(1)}`)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
              transition: 'all 0.2s', marginBottom: '2px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = theme.card
              e.currentTarget.style.borderRadius = '10px'
            }}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div>
              <p style={{
                color: theme.text, fontSize: '0.875rem',
                fontWeight: '600', margin: '0 0 2px'
              }}>
                {tag}
              </p>
              <p style={{ color: theme.textHint, fontSize: '0.72rem', margin: 0 }}>
                {(i + 1) * 234} posts
              </p>
            </div>
            <span style={{ color: theme.textHint, fontSize: '12px' }}>→</span>
          </div>
        ))}
      </div>

      {/* Suggested users */}
      <div>
        <p style={{
          color: theme.textHint, fontSize: '0.68rem', fontWeight: '700',
          letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px'
        }}>
          Suggested for you
        </p>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: '60px', background: theme.card,
                borderRadius: '12px', border: `1px solid ${theme.border}`
              }} />
            ))}
          </div>
        ) : suggested.length === 0 ? (
          <p style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
            No suggestions yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {suggested.map(u => <UserCard key={u.id} user={u} />)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '32px', paddingTop: '16px',
        borderTop: `1px solid ${theme.border}`
      }}>
        <p style={{
          color: theme.textHint, fontSize: '0.72rem', textAlign: 'center'
        }}>
          © 2024 ConnectHub · CodeAlpha Internship
        </p>
      </div>
    </aside>
  )
}

export default RightSidebar