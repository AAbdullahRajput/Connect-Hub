import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { createPost, uploadMedia } from '../api/axios'
 
// ─── SVG Icons ────────────────────────────────────────────────────────────────
 
const PhotoIcon = ({ color, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <rect x="1" y="2" width="13" height="11" rx="2" stroke={color} strokeWidth="1.2" />
    <circle cx="5" cy="6" r="1.3" stroke={color} strokeWidth="1.1" />
    <path d="M1 10l3.5-3.5 3 3 2-2 3.5 3.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
 
const VideoIcon = ({ color, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <rect x="1" y="3" width="9" height="9" rx="1.5" stroke={color} strokeWidth="1.2" />
    <path d="M10 6l4-2.5v8L10 9V6z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
)
 
const SendIcon = ({ color, size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path d="M1.5 6.5l9-5-5 9-1.5-3L1.5 6.5z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
)
 
const SpinnerIcon = ({ color, size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 13 13" fill="none" aria-hidden="true"
    style={{ animation: 'spin 0.8s linear infinite' }}>
    <circle cx="6.5" cy="6.5" r="5" stroke={color} strokeWidth="1.5" strokeDasharray="10 20" />
  </svg>
)
 
const CloseIcon = ({ color, size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M1 1l8 8M9 1L1 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
 
const WarningIcon = ({ color, size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path d="M6.5 1.5L12 11H1L6.5 1.5Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M6.5 5v3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="6.5" cy="9.5" r="0.55" fill={color} />
  </svg>
)
 
// ─── Component ────────────────────────────────────────────────────────────────
 
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
  const overLimit = content.length > 400
 
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
 
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
 
      <div style={{
        background: theme.card,
        border: `1px solid ${focused ? theme.accentBorder : theme.border}`,
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focused ? `0 0 0 3px ${theme.accentMuted}` : 'none',
        fontFamily: theme.font,
      }}>
 
        {/* ── Top row: avatar + textarea ── */}
        <div style={{ display: 'flex', gap: '14px' }}>
 
          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                style={{
                  width: '42px', height: '42px',
                  borderRadius: '50%', objectFit: 'cover',
                  border: `1.5px solid ${theme.border}`,
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: theme.avatarGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: '700', fontSize: '16px',
                letterSpacing: '0.02em',
              }}>
                {initials}
              </div>
            )}
          </div>
 
          {/* Textarea */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="What's on your mind?"
              rows={focused || content ? 3 : 1}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: theme.text,
                fontSize: '0.95rem',
                resize: 'none',
                outline: 'none',
                fontFamily: theme.font,
                lineHeight: '1.65',
                transition: 'rows 0.2s',
                boxSizing: 'border-box',
              }}
            />
            {content.length > 0 && (
              <div style={{
                textAlign: 'right',
                color: overLimit ? theme.danger : theme.textHint,
                fontSize: '0.72rem',
                marginTop: '4px',
                fontWeight: overLimit ? '700' : '400',
              }}>
                {content.length} / 500
              </div>
            )}
          </div>
        </div>
 
        {/* ── File preview ── */}
        {preview && (
          <div style={{ position: 'relative', marginTop: '16px', marginLeft: '56px' }}>
            {file?.type.startsWith('image') ? (
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: '100%', maxHeight: '280px', objectFit: 'cover',
                  borderRadius: '14px', border: `1px solid ${theme.border}`,
                  display: 'block',
                }}
              />
            ) : (
              <video
                src={preview}
                controls
                style={{
                  width: '100%', maxHeight: '280px',
                  borderRadius: '14px', border: `1px solid ${theme.border}`,
                  display: 'block',
                }}
              />
            )}
            <button
              onClick={removeFile}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'rgba(0,0,0,0.75)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', borderRadius: '50%',
                width: '28px', height: '28px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.92)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
            >
              <CloseIcon color="#fff" size={9} />
            </button>
          </div>
        )}
 
        {/* ── Error ── */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            color: theme.danger, fontSize: '0.8rem',
            marginTop: '12px', marginLeft: '56px',
          }}>
            <WarningIcon color={theme.danger} />
            <span>{error}</span>
          </div>
        )}
 
        {/* ── Bottom bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '16px', paddingTop: '14px',
          borderTop: `1px solid ${theme.border}`,
          marginLeft: '56px',
        }}>
 
          {/* Upload buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { accept: 'image/*', Icon: PhotoIcon, label: 'Photo' },
              { accept: 'video/*', Icon: VideoIcon, label: 'Video' },
            ].map(({ accept, Icon, label }) => (
              <label
                key={label}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '100px',
                  background: 'transparent', border: `1px solid ${theme.border}`,
                  color: theme.textMuted, fontSize: '0.8rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: theme.font,
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
                <Icon color="currentColor" size={14} />
                <span>{label}</span>
                <input
                  type="file"
                  accept={accept}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
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
              fontWeight: '700',
              padding: '9px 22px',
              borderRadius: '100px',
              border: `1px solid ${loading || !canPost ? theme.border : 'transparent'}`,
              fontSize: '0.875rem',
              cursor: loading || !canPost ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontFamily: theme.font,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: canPost && !loading ? `0 4px 16px ${theme.accentMuted}` : 'none',
            }}
            onMouseEnter={e => { if (canPost && !loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {loading
              ? <><SpinnerIcon color={theme.textMuted} /> Posting…</>
              : <><SendIcon color="#fff" /> Post</>
            }
          </button>
        </div>
      </div>
    </>
  )
}
 
export default CreatePost
 