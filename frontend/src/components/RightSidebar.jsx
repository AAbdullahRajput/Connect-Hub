import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { getSuggestedUsers } from '../api/axios'
import UserCard from './UserCard'
 
// ─── SVG Icons ───────────────────────────────────────────────────────────────
 
const SearchIcon = ({ color = 'currentColor', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="5" stroke={color} strokeWidth="1.3" />
    <path d="M11.5 11.5l3.5 3.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)
 
const ChevronRightIcon = ({ color = 'currentColor', size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M4.5 2.5l3 3-3 3" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
 
const TrendingIcon = ({ color = 'currentColor', size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <polyline points="1 10 5 6 8 9 13 3" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="10 3 13 3 13 6" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
 
// ─────────────────────────────────────────────────────────────────────────────
 
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
      fontFamily: theme.font,
    }}>
 
      {/* ── Search ── */}
      <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '13px', top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center',
            color: theme.textMuted, pointerEvents: 'none',
          }}>
            <SearchIcon size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search ConnectHub..."
            style={{
              width: '100%', background: theme.card,
              border: `1px solid ${theme.border}`, color: theme.text,
              borderRadius: '100px', padding: '10px 16px 10px 36px',
              fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
              fontFamily: theme.font, transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = theme.accent}
            onBlur={e => e.target.style.borderColor = theme.border}
          />
        </div>
      </form>
 
      {/* ── Trending ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginBottom: '12px',
        }}>
          <TrendingIcon color={theme.textHint} size={13} />
          <p style={{
            color: theme.textHint, fontSize: '0.68rem', fontWeight: '700',
            letterSpacing: '1px', textTransform: 'uppercase', margin: 0,
          }}>
            Trending
          </p>
        </div>
 
        {['#ConnectHub', '#Social', '#Tech', '#CodeAlpha'].map((tag, i) => (
          <div
            key={tag}
            onClick={() => navigate(`/search?q=${tag.slice(1)}`)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
              transition: 'all 0.2s', marginBottom: '2px',
            }}
            onMouseEnter={e => e.currentTarget.style.background = theme.card}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div>
              <p style={{
                color: theme.text, fontSize: '0.875rem',
                fontWeight: '600', margin: '0 0 2px',
              }}>
                {tag}
              </p>
              <p style={{ color: theme.textHint, fontSize: '0.72rem', margin: 0 }}>
                {(i + 1) * 234} posts
              </p>
            </div>
            <ChevronRightIcon color={theme.textHint} size={12} />
          </div>
        ))}
      </div>
 
      {/* ── Suggested users ── */}
      <div>
        <p style={{
          color: theme.textHint, fontSize: '0.68rem', fontWeight: '700',
          letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px',
        }}>
          Suggested for you
        </p>
 
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: '60px', background: theme.card,
                borderRadius: '12px', border: `1px solid ${theme.border}`,
              }} />
            ))}
          </div>
        ) : suggested.length === 0 ? (
          <p style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
            No suggestions yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {suggested.map(u => <UserCard key={u.id} user={u} />)}
          </div>
        )}
      </div>
 
      {/* ── Footer ── */}
      <div style={{
        marginTop: '32px', paddingTop: '16px',
        borderTop: `1px solid ${theme.border}`,
      }}>
        <p style={{ color: theme.textHint, fontSize: '0.72rem', textAlign: 'center', margin: 0 }}>
          © 2024 ConnectHub · CodeAlpha Internship
        </p>
      </div>
    </aside>
  )
}
 
export default RightSidebar