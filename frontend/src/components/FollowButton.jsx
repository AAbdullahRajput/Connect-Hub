import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { followUser, unfollowUser, checkFollow } from '../api/axios'

const FollowButton = ({ targetUserId, onFollowChange, size = 'md' }) => {
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
      } catch {
        // silent
      } finally {
        setChecking(false)
      }
    }
    check()
  }, [targetUserId, user?.id])

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
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const padding = size === 'sm' ? '6px 14px' : '8px 20px'
  const fontSize = size === 'sm' ? '0.75rem' : '0.82rem'

  if (checking) {
    return (
      <button
        disabled
        style={{
          padding,
          borderRadius: '100px',
          fontSize,
          fontWeight: '600',
          background: theme.surface,
          color: theme.textMuted,
          border: `1px solid ${theme.border}`,
          cursor: 'not-allowed',
          fontFamily: theme.font,
          minWidth: '80px',
        }}
      >
        &nbsp;
      </button>
    )
  }

  const getStyle = () => {
    if (loading) {
      return {
        background: theme.surface,
        color: theme.textMuted,
        border: `1px solid ${theme.border}`,
        cursor: 'not-allowed',
        opacity: 0.7,
      }
    }
    if (isFollowing && hovered) {
      return {
        background: theme.dangerMuted,
        border: `1px solid ${theme.dangerBorder}`,
        color: theme.danger,
        cursor: 'pointer',
      }
    }
    if (isFollowing) {
      return {
        background: 'transparent',
        border: `1px solid ${theme.borderHover}`,
        color: theme.textSecondary,
        cursor: 'pointer',
      }
    }
    return {
      background: theme.accent,
      border: `1px solid transparent`,
      color: '#fff',
      cursor: 'pointer',
    }
  }

  const getLabel = () => {
    if (loading) return 'Loading'
    if (isFollowing && hovered) return 'Unfollow'
    if (isFollowing) return 'Following'
    return 'Follow'
  }

  const getIcon = () => {
    if (loading) {
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" />
        </svg>
      )
    }
    if (isFollowing && hovered) {
      return (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M2 2l7 7M9 2l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    }
    if (isFollowing) {
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
    return (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding,
        borderRadius: '100px',
        fontSize,
        fontWeight: '600',
        transition: 'all 0.2s',
        fontFamily: theme.font,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        minWidth: '80px',
        justifyContent: 'center',
        letterSpacing: '0.01em',
        ...getStyle(),
      }}
    >
      {getIcon()}
      {getLabel()}
    </button>
  )
}

export default FollowButton