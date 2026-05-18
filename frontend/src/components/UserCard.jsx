import { useState } from 'react'
import { Link } from 'react-router-dom'
import FollowButton from './FollowButton'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
 
// ─── SVG Icon ────────────────────────────────────────────────────────────────
 
const FollowersIcon = ({ color = 'currentColor', size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 11 11" fill="none" aria-hidden="true">
    <circle cx="4" cy="3.5" r="2" stroke={color} strokeWidth="1" />
    <path d="M1 9c0-1.657 1.343-3 3-3" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <circle cx="8" cy="3.5" r="1.5" stroke={color} strokeWidth="1" />
    <path d="M6 9c0-1.105.895-2 2-2" stroke={color} strokeWidth="1" strokeLinecap="round" />
  </svg>
)
 
// ─────────────────────────────────────────────────────────────────────────────
 
const UserCard = ({ user: profileUser }) => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [hovered, setHovered] = useState(false)
 
  const initials = profileUser?.name
    ? profileUser.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
 
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderRadius: '14px',
        background: hovered ? theme.card : 'transparent',
        border: `1px solid ${hovered ? theme.border : 'transparent'}`,
        transition: 'all 0.2s', fontFamily: theme.font,
      }}
    >
      {/* ── Left: avatar + info ── */}
      <Link
        to={`/profile/${profileUser?.username}`}
        style={{
          textDecoration: 'none', display: 'flex',
          alignItems: 'center', gap: '12px', flex: 1, minWidth: 0,
        }}
      >
        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          {profileUser?.profile_picture ? (
            <img
              src={profileUser.profile_picture}
              alt={profileUser.name}
              style={{
                width: '42px', height: '42px', borderRadius: '50%',
                objectFit: 'cover', border: `1.5px solid ${theme.border}`,
                display: 'block',
              }}
            />
          ) : (
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: theme.avatarGradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '700', fontSize: '14px',
              letterSpacing: '0.03em',
            }}>
              {initials}
            </div>
          )}
        </div>
 
        {/* Name + username + followers count */}
        <div style={{ minWidth: 0 }}>
          <p style={{
            color: theme.text, fontSize: '0.875rem', fontWeight: '600',
            margin: '0 0 1px', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {profileUser?.name}
          </p>
          <p style={{
            color: theme.textMuted, fontSize: '0.75rem', margin: '0 0 2px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            @{profileUser?.username}
          </p>
          {profileUser?.followers_count !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FollowersIcon color={theme.textHint} size={11} />
              <span style={{ color: theme.textHint, fontSize: '0.68rem', fontWeight: '500' }}>
                {profileUser.followers_count.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </Link>
 
      {/* ── Right: follow button ── */}
      {user?.id !== profileUser?.id && (
        <div style={{ marginLeft: '12px', flexShrink: 0 }}>
          <FollowButton targetUserId={profileUser?.id} size="sm" />
        </div>
      )}
    </div>
  )
}
 
export default UserCard
 