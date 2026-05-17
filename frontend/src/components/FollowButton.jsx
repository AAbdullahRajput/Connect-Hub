import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { followUser, unfollowUser, checkFollow } from '../api/axios'

const FollowButton = ({ targetUserId, onFollowChange }) => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const check = async () => {
      if (!targetUserId || user?.id === targetUserId) {
        setChecking(false)
        return
      }
      try {
        const res = await checkFollow(targetUserId)
        setIsFollowing(res.data.is_following)
      } catch (err) {
        console.error(err)
      } finally {
        setChecking(false)
      }
    }
    check()
  }, [targetUserId])

  if (user?.id === targetUserId) return null

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId)
        setIsFollowing(false)
        if (onFollowChange) onFollowChange(false)
      } else {
        await followUser(targetUserId)
        setIsFollowing(true)
        if (onFollowChange) onFollowChange(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <button disabled style={{
        padding: '8px 20px', borderRadius: '100px',
        fontSize: '0.8rem', fontWeight: '600',
        background: theme.surface, color: theme.textMuted,
        border: `1px solid ${theme.border}`, cursor: 'not-allowed',
        fontFamily: theme.font
      }}>
        •••
      </button>
    )
  }

  const getStyle = () => {
    if (loading) {
      return {
        background: theme.surface, color: theme.textMuted,
        border: `1px solid ${theme.border}`,
        cursor: 'not-allowed', opacity: 0.7
      }
    }
    if (isFollowing && hovered) {
      return {
        background: theme.dangerMuted,
        border: `1px solid ${theme.dangerBorder}`,
        color: theme.danger, cursor: 'pointer'
      }
    }
    if (isFollowing) {
      return {
        background: theme.surface,
        border: `1px solid ${theme.borderHover}`,
        color: theme.textSecondary, cursor: 'pointer'
      }
    }
    if (hovered) {
      return {
        background: `linear-gradient(135deg, ${theme.accentHover}, ${theme.accent})`,
        border: '1px solid transparent',
        color: '#fff', cursor: 'pointer',
        boxShadow: `0 4px 20px ${theme.accentMuted}`
      }
    }
    return {
      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
      border: '1px solid transparent',
      color: '#fff', cursor: 'pointer',
      boxShadow: `0 4px 16px ${theme.accentMuted}`
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 20px', borderRadius: '100px',
        fontSize: '0.8rem', fontWeight: '700',
        transition: 'all 0.2s', fontFamily: theme.font,
        letterSpacing: '0.3px',
        display: 'flex', alignItems: 'center', gap: '6px',
        ...getStyle()
      }}
    >
      {loading ? (
        <>⏳ <span>Loading</span></>
      ) : isFollowing && hovered ? (
        <>✕ <span>Unfollow</span></>
      ) : isFollowing ? (
        <>✓ <span>Following</span></>
      ) : (
        <>+ <span>Follow</span></>
      )}
    </button>
  )
}

export default FollowButton