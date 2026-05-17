import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { followUser, unfollowUser, checkFollow } from '../api/axios'

const FollowButton = ({ targetUserId, onFollowChange }) => {
  const { user } = useAuth()
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
        background: '#27272a', color: '#52525b',
        border: '1px solid #27272a', cursor: 'not-allowed',
        fontFamily: "'Inter', system-ui, sans-serif"
      }}>
        •••
      </button>
    )
  }

  const getStyle = () => {
    if (loading) {
      return {
        background: '#27272a', color: '#71717a',
        border: '1px solid #27272a', cursor: 'not-allowed', opacity: 0.7
      }
    }
    if (isFollowing && hovered) {
      return {
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.35)',
        color: '#f87171', cursor: 'pointer'
      }
    }
    if (isFollowing) {
      return {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid #3f3f46',
        color: '#d4d4d8', cursor: 'pointer'
      }
    }
    if (hovered) {
      return {
        background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
        border: '1px solid transparent',
        color: '#fff', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(37,99,235,0.4)'
      }
    }
    return {
      background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
      border: '1px solid transparent',
      color: '#fff', cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(37,99,235,0.3)'
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
        transition: 'all 0.2s',
        fontFamily: "'Inter', system-ui, sans-serif",
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