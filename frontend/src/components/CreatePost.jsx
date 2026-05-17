import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createPost, uploadMedia } from '../api/axios'

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async () => {
    if (!content.trim() && !file) {
      setError('Write something or add a file')
      return
    }
    setError('')
    setLoading(true)

    try {
      let image_url = null
      let video_url = null
      let post_type = 'text'

      // Upload file if selected
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await uploadMedia(formData, 'posts')
        const url = uploadRes.data.url
        const mediaType = uploadRes.data.media_type

        if (mediaType === 'image') {
          image_url = url
          post_type = content.trim() ? 'mixed' : 'image'
        } else {
          video_url = url
          post_type = content.trim() ? 'mixed' : 'video'
        }
      }

      // Create post
      const res = await createPost({
        content: content.trim() || null,
        image_url,
        video_url,
        post_type
      })

      // Reset form
      setContent('')
      setFile(null)
      setPreview(null)

      if (onPostCreated) onPostCreated(res.data.post)

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">

      {/* Top row */}
      <div className="flex gap-3">
        {/* Avatar */}
        {user?.profile_picture ? (
          <img
            src={user.profile_picture}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border border-zinc-700 flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        )}

        {/* Text input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm resize-none focus:outline-none"
        />
      </div>

      {/* File preview */}
      {preview && (
        <div className="relative mt-4 ml-13">
          {file?.type.startsWith('image') ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-64 object-cover rounded-xl"
            />
          ) : (
            <video
              src={preview}
              controls
              className="w-full max-h-64 rounded-xl"
            />
          )}
          <button
            onClick={removeFile}
            className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-black transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs mt-3">{error}</p>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">

        {/* File upload buttons */}
        <div className="flex gap-3">
          <label className="cursor-pointer text-gray-400 hover:text-blue-400 transition text-sm flex items-center gap-1">
            <span>🖼️</span>
            <span>Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <label className="cursor-pointer text-gray-400 hover:text-blue-400 transition text-sm flex items-center gap-1">
            <span>🎥</span>
            <span>Video</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Post button */}
        <button
          onClick={handleSubmit}
          disabled={loading || (!content.trim() && !file)}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-full transition"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>

      </div>
    </div>
  )
}

export default CreatePost