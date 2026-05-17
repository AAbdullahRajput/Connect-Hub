import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { createPost, uploadMedia } from '../api/axios'

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth()
  const { theme } = useTheme()
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

  const canPost = content.trim() || file

  return (
    <div style={{
      background: theme.card,
      border: `1px solid ${focused ? theme.accentBorder : theme.border}`,
      borderRadius: '20px', padding: '20px', marginBottom: '20px',
      transition: 'all 0.2s',
      boxShadow: focused ? `0 0 0 3px ${theme.accentMuted}` : 'none',
      fontFamily: theme.font
    }}>

      {/* Top area */}
      <div style={{ display: 'flex', gap: '14px' }}>

        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt={user.name} style={{
              width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover',
              border: `2px solid ${theme.accentBorder}`
            }} />
          ) : (
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: theme.avatarGradient,
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
              border: 'none', color: theme.text, fontSize: '1rem',
              resize: 'none', outline: 'none', fontFamily: theme.font,
              lineHeight: '1.6', transition: 'all 0.2s', boxSizing: 'border-box'
            }}
          />
          {content.length > 0 && (
            <div style={{
              textAlign: 'right',
              color: content.length > 400 ? theme.danger : theme.textHint,
              fontSize: '0.75rem', marginTop: '4px'
            }}>
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
              borderRadius: '14px', border: `1px solid ${theme.border}`
            }} />
          ) : (
            <video src={preview} controls style={{
              width: '100%', maxHeight: '280px', borderRadius: '14px',
              border: `1px solid ${theme.border}`
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
        <p style={{
          color: theme.danger, fontSize: '0.8rem',
          marginTop: '10px', marginLeft: '56px'
        }}>
          ⚠️ {error}
        </p>
      )}

      {/* Bottom bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: '16px', paddingTop: '14px',
        borderTop: `1px solid ${theme.border}`,
        marginLeft: '56px'
      }}>

        {/* Upload buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { accept: 'image/*', icon: '🖼️', label: 'Photo' },
            { accept: 'video/*', icon: '🎥', label: 'Video' },
          ].map(({ accept, icon, label }) => (
            <label key={label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '100px',
              background: 'transparent', border: `1px solid ${theme.border}`,
              color: theme.textMuted, fontSize: '0.8rem',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = theme.accentBorder
                e.currentTarget.style.color = theme.accentText
                e.currentTarget.style.background = theme.accentMuted
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = theme.border
                e.currentTarget.style.color = theme.textMuted
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
              <input type="file" accept={accept} onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          ))}
        </div>

        {/* Post button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !canPost}
          style={{
            background: loading || !canPost
              ? theme.surface
              : `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
            color: loading || !canPost ? theme.textMuted : '#fff',
            fontWeight: '700', padding: '9px 22px', borderRadius: '100px',
            border: 'none', fontSize: '0.9rem',
            cursor: loading || !canPost ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', fontFamily: theme.font,
            boxShadow: canPost && !loading
              ? `0 4px 16px ${theme.accentMuted}`
              : 'none'
          }}
          onMouseEnter={e => { if (canPost && !loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {loading ? '⏳ Posting...' : '✦ Post'}
        </button>
      </div>
    </div>
  )
}

export default CreatePost