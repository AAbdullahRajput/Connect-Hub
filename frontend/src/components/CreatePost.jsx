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
  const [focused, setFocused] = useState(false)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const removeFile = () => { setFile(null); setPreview(null) }

  const handleSubmit = async () => {
    if (!content.trim() && !file) { setError('Write something or add a file'); return }
    setError('')
    setLoading(true)
    try {
      let image_url = null, video_url = null, post_type = 'text'
      if (file) {
        const fd = new FormData()
        fd.append('file', file)
        const uploadRes = await uploadMedia(fd, 'posts')
        const { url, media_type } = uploadRes.data
        if (media_type === 'image') {
          image_url = url
          post_type = content.trim() ? 'mixed' : 'image'
        } else {
          video_url = url
          post_type = content.trim() ? 'mixed' : 'video'
        }
      }
      const res = await createPost({ content: content.trim() || null, image_url, video_url, post_type })
      setContent(''); setFile(null); setPreview(null)
      if (onPostCreated) onPostCreated(res.data.post)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#18181b', border: `1px solid ${focused ? 'rgba(37,99,235,0.4)' : '#27272a'}`,
      borderRadius: '20px', padding: '20px', marginBottom: '20px',
      transition: 'border-color 0.2s',
      boxShadow: focused ? '0 0 0 3px rgba(37,99,235,0.08)' : 'none',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>

      {/* Top area */}
      <div style={{ display: 'flex', gap: '14px' }}>
        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt={user.name} style={{
              width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover',
              border: '2px solid rgba(37,99,235,0.3)'
            }} />
          ) : (
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '700', fontSize: '16px'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Text input */}
        <div style={{ flex: 1 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="What's on your mind?"
            rows={focused || content ? 3 : 1}
            style={{
              width: '100%', background: 'transparent',
              border: 'none', color: '#fff', fontSize: '1rem',
              resize: 'none', outline: 'none', fontFamily: 'inherit',
              lineHeight: '1.6', transition: 'all 0.2s', boxSizing: 'border-box'
            }}
          />
          {/* Char count */}
          {content.length > 0 && (
            <div style={{ textAlign: 'right', color: content.length > 280 ? '#f87171' : '#3f3f50', fontSize: '0.75rem', marginTop: '4px' }}>
              {content.length}/500
            </div>
          )}
        </div>
      </div>

      {/* File preview */}
      {preview && (
        <div style={{ position: 'relative', marginTop: '16px', marginLeft: '56px' }}>
          {file?.type.startsWith('image') ? (
            <img src={preview} alt="Preview" style={{
              width: '100%', maxHeight: '280px', objectFit: 'cover',
              borderRadius: '14px', border: '1px solid #27272a'
            }} />
          ) : (
            <video src={preview} controls style={{
              width: '100%', maxHeight: '280px', borderRadius: '14px',
              border: '1px solid #27272a'
            }} />
          )}
          <button onClick={removeFile} style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'rgba(0,0,0,0.8)', color: '#fff', border: 'none',
            borderRadius: '50%', width: '28px', height: '28px',
            cursor: 'pointer', fontSize: '14px', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '10px', marginLeft: '56px' }}>⚠️ {error}</p>
      )}

      {/* Bottom bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: '16px', paddingTop: '14px',
        borderTop: '1px solid rgba(255,255,255,0.05)', marginLeft: '56px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { accept: 'image/*', icon: '🖼️', label: 'Photo' },
            { accept: 'video/*', icon: '🎥', label: 'Video' },
          ].map(({ accept, icon, label }) => (
            <label key={label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '100px',
              background: 'transparent', border: '1px solid #27272a',
              color: '#71717a', fontSize: '0.8rem', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#71717a' }}
            >
              <span>{icon}</span><span>{label}</span>
              <input type="file" accept={accept} onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={loading || (!content.trim() && !file)} style={{
          background: loading || (!content.trim() && !file)
            ? '#27272a'
            : 'linear-gradient(135deg, #2563EB, #1d4ed8)',
          color: loading || (!content.trim() && !file) ? '#52525b' : '#fff',
          fontWeight: '700', padding: '9px 22px', borderRadius: '100px',
          border: 'none', fontSize: '0.9rem', cursor: loading || (!content.trim() && !file) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', fontFamily: 'inherit',
          boxShadow: !loading && (content.trim() || file) ? '0 4px 16px rgba(37,99,235,0.3)' : 'none'
        }}>
          {loading ? '⏳ Posting...' : '✦ Post'}
        </button>
      </div>
    </div>
  )
}

export default CreatePost