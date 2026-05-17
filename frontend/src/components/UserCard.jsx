import { useState } from 'react'
import { Link } from 'react-router-dom'
import FollowButton from './FollowButton'
import { useAuth } from '../context/AuthContext'

const UserCard = ({ user: profileUser }) => {
  const { user } = useAuth()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderRadius: '14px',
        background: hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? '#3f3f46' : 'rgba(255,255,255,0.05)'}`,
        transition: 'all 0.2s', fontFamily: "'Inter', system-ui, sans-serif"
      }}
    >
      {/* Left — avatar + info */}
      <Link
        to={`/profile/${profileUser?.username}`}
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}
      >
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {profileUser?.profile_picture ? (
            <img
              src={profileUser.profile_picture}
              alt={profileUser.name}
              style={{
                width: '42px', height: '42px', borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(37,99,235,0.3)'
              }}
            />
          ) : (
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
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
            background: '#22c55e', border: '2px solid #09090b'
          }} />
        </div>

        {/* Info */}
        <div style={{ minWidth: 0 }}>
          <p style={{
            color: '#e4e4e7', fontSize: '0.875rem', fontWeight: '600',
            margin: '0 0 2px', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {profileUser?.name}
          </p>
          <p style={{
            color: '#52525b', fontSize: '0.75rem', margin: '0 0 3px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            @{profileUser?.username}
          </p>
          {profileUser?.followers_count !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px' }}>👥</span>
              <span style={{ color: '#3f3f50', fontSize: '0.7rem' }}>
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