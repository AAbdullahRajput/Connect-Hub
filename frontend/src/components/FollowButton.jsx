import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { followUser, unfollowUser, checkFollow } from '../api/axios'

const FollowButton = ({ targetUserId, onFollowChange }) => {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Check follow status on mount
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

  // Don't show button for own profile
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
      <button
        disabled
        className="px-5 py-2 rounded-full text-sm font-semibold bg-zinc-800 text-gray-500 cursor-not-allowed"
      >
        ...
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
        isFollowing
          ? 'bg-zinc-800 border border-zinc-600 text-white hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}

export default FollowButton