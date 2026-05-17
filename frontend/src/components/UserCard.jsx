import { Link } from 'react-router-dom'
import FollowButton from './FollowButton'
import { useAuth } from '../context/AuthContext'

const UserCard = ({ user: profileUser }) => {
  const { user } = useAuth()

  return (
    <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition">

      {/* Left — avatar + info */}
      <Link
        to={`/profile/${profileUser?.username}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        {/* Avatar */}
        {profileUser?.profile_picture ? (
          <img
            src={profileUser.profile_picture}
            alt={profileUser.name}
            className="w-10 h-10 rounded-full object-cover border border-zinc-700 flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            {profileUser?.name?.[0]?.toUpperCase()}
          </div>
        )}

        {/* Info */}
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {profileUser?.name}
          </p>
          <p className="text-gray-400 text-xs truncate">
            @{profileUser?.username}
          </p>
          {profileUser?.followers_count !== undefined && (
            <p className="text-gray-500 text-xs">
              {profileUser.followers_count} followers
            </p>
          )}
        </div>
      </Link>

      {/* Right — follow button */}
      {user?.id !== profileUser?.id && (
        <div className="ml-3 flex-shrink-0">
          <FollowButton targetUserId={profileUser?.id} />
        </div>
      )}

    </div>
  )
}

export default UserCard