import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import { useAuth } from '../context/AuthContext'
import { updateProfile, uploadMedia, updateProfilePicture, updateCoverPhoto } from '../api/axios'

const EditProfile = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    email: user?.email || '',
  })

  const [avatarFile, setAvatarFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_picture || null)
  const [coverPreview, setCoverPreview] = useState(user?.cover_photo || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Upload avatar if changed
      if (avatarFile) {
        const formDataObj = new FormData()
        formDataObj.append('file', avatarFile)
        const res = await uploadMedia(formDataObj, 'avatars')
        await updateProfilePicture(res.data.url)
      }

      // Upload cover if changed
      if (coverFile) {
        const formDataObj = new FormData()
        formDataObj.append('file', coverFile)
        const res = await uploadMedia(formDataObj, 'covers')
        await updateCoverPhoto(res.data.url)
      }

      // Update profile text fields
      const res = await updateProfile(formData)

      // Update auth context
      updateUser({
        ...user,
        ...res.data.user,
        profile_picture: avatarFile
          ? avatarPreview
          : user?.profile_picture,
        cover_photo: coverFile
          ? coverPreview
          : user?.cover_photo,
      })

      setSuccess('Profile updated successfully!')
      setTimeout(() => navigate(`/profile/${formData.username}`), 1500)

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <Navbar />

      <div className="max-w-6xl mx-auto flex pt-16">

        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main content */}
        <main className="flex-1 lg:ml-64 px-4 py-6 max-w-2xl mx-auto w-full">

          <h1 className="text-2xl font-bold text-white mb-6">Edit Profile</h1>

          {/* Cover photo */}
          <div className="relative h-40 bg-zinc-900 rounded-2xl overflow-hidden mb-6 group">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-zinc-900" />
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <span className="text-white text-sm font-medium">
                📷 Change Cover
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-zinc-900 bg-blue-600 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <span className="text-white text-xs">📷</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="text-white font-semibold">{user?.name}</p>
              <p className="text-gray-400 text-sm">@{user?.username}</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Tell people about yourself..."
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition resize-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => navigate(`/profile/${user?.username}`)}
                className="px-6 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Cancel
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default EditProfile