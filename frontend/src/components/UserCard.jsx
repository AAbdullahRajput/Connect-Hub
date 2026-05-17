import { useState } from 'react'
import { Link } from 'react-router-dom'
import FollowButton from './FollowButton'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const UserCard = ({ user: profileUser }) => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderRadius: '14px',
        background: hovered ? theme.card : theme.surface,
        border: `1px solid ${hovered ? theme.borderHover : theme.border}`,
        transition: 'all 0.2s', fontFamily: theme.font
      }}
    >
      {/* Left — avatar + info */}
      <Link
        to={`/profile/${profileUser?.username}`}
        style={{
          textDecoration: 'none', display: 'flex',
          alignItems: 'center', gap: '12px', flex: 1, minWidth: 0
        }}
      >
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {profileUser?.profile_picture ? (
            <img
              src={profileUser.profile_picture}
              alt={profileUser.name}
              style={{
                width: '42px', height: '42px', borderRadius: '50%',
                objectFit: 'cover', border: `2px solid ${theme.accentBorder}`
              }}
            />
          ) : (
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: theme.avatarGradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '700', fontSize: '16px'
            }}>
              {profileUser?.name?.[0]?.toUpperCase()}
            </div>
          )}
          {/* Online dot */}
          <div style={{
            position: 'absolute', bottom: '1px', right: '1px',
            width: '10px', height: '10px', borderRadius: '50%',
            background: theme.success,
            border: `2px solid ${theme.surface}`
          }} />
        </div>

        {/* Info */}
        <div style={{ minWidth: 0 }}>
          <p style={{
            color: theme.text, fontSize: '0.875rem', fontWeight: '600',
            margin: '0 0 2px', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {profileUser?.name}
          </p>
          <p style={{
            color: theme.textMuted, fontSize: '0.75rem',
            margin: '0 0 3px', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            @{profileUser?.username}
          </p>
          {profileUser?.followers_count !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px' }}>👥</span>
              <span style={{ color: theme.textHint, fontSize: '0.7rem' }}>
                {profileUser.followers_count.toLocaleString()} followers
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Right — follow button */}
      {user?.id !== profileUser?.id && (
        <div style={{ marginLeft: '12px', flexShrink: 0 }}>
          <FollowButton targetUserId={profileUser?.id} />
        </div>
      )}
    </div>
  )
}

export default UserCard