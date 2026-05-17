import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { updateProfile, uploadMedia, updateProfilePicture, updateCoverPhoto } from '../api/axios'

const EditProfile = () => {
  const { user, updateUser } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    email: user?.email || '',
    website: user?.website || '',
    location: user?.location || '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_picture || null)
  const [coverPreview, setCoverPreview] = useState(user?.cover_photo || null)
  const [coverPosition, setCoverPosition] = useState(user?.cover_position || 50)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartPos, setDragStartPos] = useState(50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeSection, setActiveSection] = useState('profile')
  const [coverHovered, setCoverHovered] = useState(false)
  const [avatarHovered, setAvatarHovered] = useState(false)
  const coverRef = useRef(null)

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

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
    setCoverPosition(50)
  }

  // Drag to reposition cover
  const handleDragStart = (e) => {
    setIsDragging(true)
    setDragStartY(e.clientY || e.touches?.[0]?.clientY)
    setDragStartPos(coverPosition)
    e.preventDefault()
  }

  const handleDragMove = (e) => {
    if (!isDragging || !coverRef.current) return
    const clientY = e.clientY || e.touches?.[0]?.clientY
    const delta = clientY - dragStartY
    const containerHeight = coverRef.current.offsetHeight
    const newPos = Math.max(0, Math.min(100, dragStartPos - (delta / containerHeight) * 100))
    setCoverPosition(Math.round(newPos))
  }

  const handleDragEnd = () => setIsDragging(false)

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (avatarFile) {
        const fd = new FormData()
        fd.append('file', avatarFile)
        const res = await uploadMedia(fd, 'avatars')
        await updateProfilePicture(res.data.url)
      }
      if (coverFile) {
        const fd = new FormData()
        fd.append('file', coverFile)
        const res = await uploadMedia(fd, 'covers')
        await updateCoverPhoto(res.data.url)
      }
      const res = await updateProfile({ ...formData, cover_position: coverPosition })
      updateUser({
        ...user, ...res.data.user,
        profile_picture: avatarFile ? avatarPreview : user?.profile_picture,
        cover_photo: coverFile ? coverPreview : user?.cover_photo,
        cover_position: coverPosition,
        website: formData.website,
        location: formData.location,
      })
      setSuccess('Profile updated successfully!')
      setTimeout(() => navigate(`/profile/${formData.username}`), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`, color: theme.text,
    borderRadius: '12px', padding: '13px 16px', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
    fontFamily: theme.font
  }
  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: '6px',
    color: theme.textMuted, fontSize: '0.72rem', fontWeight: '700',
    marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px'
  }
  const focusIn = (e) => {
    e.target.style.borderColor = theme.accent
    e.target.style.boxShadow = `0 0 0 3px ${theme.accentMuted}`
    e.target.style.backgroundColor = theme.card
  }
  const focusOut = (e) => {
    e.target.style.borderColor = theme.border
    e.target.style.boxShadow = 'none'
    e.target.style.backgroundColor = theme.surface
  }

  const sections = [
    { id: 'profile', label: 'Profile Info', icon: '👤' },
    { id: 'photos', label: 'Photos', icon: '📷' },
    { id: 'links', label: 'Links', icon: '🔗' },
    { id: 'account', label: 'Account', icon: '⚙️' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, fontFamily: theme.font, color: theme.text }}>
      <Navbar />
      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', paddingTop: '64px' }}>
        <LeftSidebar />
        <main style={{ flex: 1, marginLeft: '260px', padding: '32px', minHeight: 'calc(100vh - 64px)' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <button onClick={() => navigate(`/profile/${user?.username}`)} style={{
              background: theme.card, border: `1px solid ${theme.border}`,
              color: theme.textSecondary, borderRadius: '10px', padding: '8px 16px',
              cursor: 'pointer', fontSize: '0.875rem', fontFamily: theme.font, transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = theme.borderHover; e.currentTarget.style.color = theme.text }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
            >← Back</button>
            <div>
              <h1 style={{ color: theme.text, fontSize: '1.5rem', fontWeight: '800', margin: '0 0 2px', letterSpacing: '-0.5px' }}>
                Edit Profile
              </h1>
              <p style={{ color: theme.textMuted, fontSize: '0.85rem', margin: 0 }}>
                Manage your public profile information
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', maxWidth: '860px' }}>

            {/* Sidebar tabs */}
            <div style={{
              width: '188px', flexShrink: 0, background: theme.card,
              border: `1px solid ${theme.border}`, borderRadius: '16px',
              padding: '8px', position: 'sticky', top: '88px'
            }}>
              <p style={{
                color: theme.textHint, fontSize: '0.65rem', fontWeight: '700',
                letterSpacing: '1px', textTransform: 'uppercase',
                padding: '8px 12px 6px', margin: 0
              }}>Settings</p>
              {sections.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 12px', borderRadius: '10px', border: 'none',
                  background: activeSection === s.id ? theme.accentMuted : 'transparent',
                  color: activeSection === s.id ? theme.accentText : theme.textMuted,
                  fontSize: '0.875rem', fontWeight: activeSection === s.id ? '700' : '500',
                  cursor: 'pointer', transition: 'all 0.2s', fontFamily: theme.font,
                  textAlign: 'left', marginBottom: '2px'
                }}
                  onMouseEnter={e => { if (activeSection !== s.id) e.currentTarget.style.background = `${theme.accentMuted}80` }}
                  onMouseLeave={e => { if (activeSection !== s.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: '16px' }}>{s.icon}</span>
                  <span>{s.label}</span>
                  {activeSection === s.id && (
                    <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: theme.accent }} />
                  )}
                </button>
              ))}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${theme.border}` }}>
                <button onClick={handleSubmit} disabled={loading} style={{
                  width: '100%', padding: '11px',
                  background: loading ? theme.accentMuted : `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                  color: loading ? theme.accentText : '#fff', fontWeight: '700',
                  border: 'none', borderRadius: '10px', fontSize: '0.875rem',
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: theme.font
                }}>
                  {loading ? '⏳ Saving...' : '✓ Save Changes'}
                </button>
              </div>
            </div>

            {/* Form content */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {error && (
                <div style={{
                  background: theme.dangerMuted, border: `1px solid ${theme.dangerBorder}`,
                  borderRadius: '12px', padding: '14px 16px', marginBottom: '20px',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <span>⚠️</span>
                  <span style={{ color: theme.danger, fontSize: '0.875rem' }}>{error}</span>
                </div>
              )}
              {success && (
                <div style={{
                  background: theme.successMuted, border: `1px solid ${theme.success}40`,
                  borderRadius: '12px', padding: '14px 16px', marginBottom: '20px',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <span>✅</span>
                  <span style={{ color: theme.success, fontSize: '0.875rem' }}>{success}</span>
                </div>
              )}

              {/* PHOTOS SECTION */}
              {activeSection === 'photos' && (
                <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '20px', overflow: 'hidden' }}>

                  {/* Cover with drag reposition */}
                  <div
                    ref={coverRef}
                    onMouseEnter={() => setCoverHovered(true)}
                    onMouseLeave={() => { setCoverHovered(false); handleDragEnd() }}
                    onMouseDown={coverPreview ? handleDragStart : undefined}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onTouchStart={coverPreview ? handleDragStart : undefined}
                    onTouchMove={handleDragMove}
                    onTouchEnd={handleDragEnd}
                    style={{
                      position: 'relative', height: '220px',
                      cursor: isDragging ? 'grabbing' : coverPreview ? 'grab' : 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover" style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        objectPosition: `center ${coverPosition}%`,
                        pointerEvents: 'none'
                      }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        background: `linear-gradient(135deg, ${theme.accentMuted}, ${theme.surface})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ color: theme.textMuted, fontSize: '0.9rem' }}>No cover photo</span>
                      </div>
                    )}

                    {/* Overlay */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: coverHovered ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.2)',
                      transition: 'background 0.2s',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '10px'
                    }}>
                      {coverPreview && (
                        <div style={{
                          background: 'rgba(255,255,255,0.15)', borderRadius: '100px',
                          padding: '6px 14px', color: '#fff', fontSize: '0.75rem',
                          fontWeight: '600', marginBottom: '4px',
                          border: '1px solid rgba(255,255,255,0.25)'
                        }}>
                          ↕ Drag to reposition · {coverPosition}%
                        </div>
                      )}

                      {/* Position slider */}
                      {coverPreview && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                          onMouseDown={e => e.stopPropagation()}>
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Top</span>
                          <input
                            type="range" min="0" max="100" value={coverPosition}
                            onChange={e => setCoverPosition(Number(e.target.value))}
                            style={{ width: '120px', accentColor: theme.accent }}
                          />
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Bottom</span>
                        </div>
                      )}

                      <label style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: `${theme.accent}cc`, color: '#fff',
                        borderRadius: '100px', padding: '8px 18px',
                        fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}>
                        📷 {coverPreview ? 'Change Cover' : 'Upload Cover'}
                        <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
                      </label>

                      {coverPreview && (
                        <button onClick={() => { setCoverFile(null); setCoverPreview(null) }} style={{
                          background: 'rgba(239,68,68,0.2)', color: '#fca5a5',
                          border: '1px solid rgba(239,68,68,0.4)',
                          borderRadius: '100px', padding: '6px 14px',
                          fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', fontFamily: theme.font
                        }}>
                          🗑️ Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Avatar section */}
                  <div style={{ padding: '28px' }}>
                    <p style={labelStyle}>Profile Picture</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div
                        onMouseEnter={() => setAvatarHovered(true)}
                        onMouseLeave={() => setAvatarHovered(false)}
                        style={{ position: 'relative', flexShrink: 0 }}
                      >
                        <div style={{
                          width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden',
                          border: `3px solid ${avatarHovered ? theme.accent : theme.accentBorder}`,
                          background: theme.avatarGradient,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '32px', fontWeight: '700',
                          transition: 'border-color 0.2s',
                          boxShadow: avatarHovered ? `0 0 0 4px ${theme.accentMuted}` : 'none'
                        }}>
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : user?.name?.[0]?.toUpperCase()}
                        </div>
                        <label style={{
                          position: 'absolute', inset: 0, borderRadius: '50%',
                          background: avatarHovered ? 'rgba(0,0,0,0.6)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                          {avatarHovered && <span style={{ fontSize: '22px' }}>📷</span>}
                          <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                        </label>
                      </div>
                      <div>
                        <p style={{ color: theme.text, fontWeight: '700', fontSize: '1rem', margin: '0 0 2px' }}>{user?.name}</p>
                        <p style={{ color: theme.textMuted, fontSize: '0.85rem', margin: '0 0 16px' }}>@{user?.username}</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <label style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: theme.accentMuted, border: `1px solid ${theme.accentBorder}`,
                            color: theme.accentText, borderRadius: '10px', padding: '8px 16px',
                            fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer'
                          }}>
                            📷 Upload Photo
                            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                          </label>
                          {avatarPreview && (
                            <button onClick={() => { setAvatarFile(null); setAvatarPreview(null) }} style={{
                              background: theme.dangerMuted, border: `1px solid ${theme.dangerBorder}`,
                              color: theme.danger, borderRadius: '10px', padding: '8px 16px',
                              fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', fontFamily: theme.font
                            }}>🗑️ Remove</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE INFO SECTION */}
              {activeSection === 'profile' && (
                <div style={{
                  background: theme.card, border: `1px solid ${theme.border}`,
                  borderRadius: '20px', padding: '28px',
                  display: 'flex', flexDirection: 'column', gap: '22px'
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    paddingBottom: '20px', borderBottom: `1px solid ${theme.border}`
                  }}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        objectFit: 'cover', border: `2px solid ${theme.accentBorder}`
                      }} />
                    ) : (
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        background: theme.avatarGradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '18px', fontWeight: '700'
                      }}>{user?.name?.[0]?.toUpperCase()}</div>
                    )}
                    <div>
                      <p style={{ color: theme.text, fontWeight: '700', fontSize: '1rem', margin: '0 0 2px' }}>{user?.name}</p>
                      <p style={{ color: theme.textMuted, fontSize: '0.82rem', margin: 0 }}>@{user?.username}</p>
                    </div>
                    <button onClick={() => setActiveSection('photos')} style={{
                      marginLeft: 'auto', background: theme.accentMuted,
                      border: `1px solid ${theme.accentBorder}`, color: theme.accentText,
                      borderRadius: '8px', padding: '7px 12px', fontSize: '0.78rem',
                      fontWeight: '600', cursor: 'pointer', fontFamily: theme.font
                    }}>📷 Change Photo</button>
                  </div>

                  <div>
                    <label style={labelStyle}><span>👤</span> Full Name</label>
                    <input type="text" name="name" value={formData.name}
                      onChange={handleChange} placeholder="Your full name"
                      style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>

                  <div>
                    <label style={labelStyle}><span>@</span> Username</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute', left: '16px', top: '50%',
                        transform: 'translateY(-50%)', color: theme.accent,
                        fontWeight: '700', pointerEvents: 'none'
                      }}>@</span>
                      <input type="text" name="username" value={formData.username}
                        onChange={handleChange} placeholder="yourhandle"
                        style={{ ...inputStyle, paddingLeft: '32px' }}
                        onFocus={focusIn} onBlur={focusOut} />
                    </div>
                    <p style={{ color: theme.textHint, fontSize: '0.72rem', marginTop: '6px' }}>
                      This is your unique public handle on ConnectHub
                    </p>
                  </div>

                  <div>
                    <label style={labelStyle}><span>📝</span> Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4}
                      placeholder="Tell the world about yourself..."
                      style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
                      onFocus={focusIn} onBlur={focusOut} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <p style={{ color: theme.textHint, fontSize: '0.72rem', margin: 0 }}>
                        A short bio that appears on your profile
                      </p>
                      <p style={{ color: formData.bio.length > 150 ? theme.danger : theme.textHint, fontSize: '0.72rem', margin: 0 }}>
                        {formData.bio.length}/160
                      </p>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}><span>📍</span> Location</label>
                    <input type="text" name="location" value={formData.location}
                      onChange={handleChange} placeholder="City, Country"
                      style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                </div>
              )}

              {/* LINKS SECTION */}
              {activeSection === 'links' && (
                <div style={{
                  background: theme.card, border: `1px solid ${theme.border}`,
                  borderRadius: '20px', padding: '28px',
                  display: 'flex', flexDirection: 'column', gap: '22px'
                }}>
                  <div>
                    <p style={{ color: theme.text, fontWeight: '700', fontSize: '1rem', margin: '0 0 4px' }}>
                      Social Links
                    </p>
                    <p style={{ color: theme.textMuted, fontSize: '0.82rem', margin: '0 0 20px' }}>
                      Add links to your website and social profiles
                    </p>
                  </div>

                  <div>
                    <label style={labelStyle}><span>🌐</span> Website</label>
                    <input type="url" name="website" value={formData.website}
                      onChange={handleChange} placeholder="https://yourwebsite.com"
                      style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>

                  {/* Coming soon links */}
                  {[
                    { icon: '🐦', label: 'Twitter / X', placeholder: '@yourhandle' },
                    { icon: '💻', label: 'GitHub', placeholder: 'github.com/username' },
                    { icon: '💼', label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
                  ].map(({ icon, label, placeholder }) => (
                    <div key={label}>
                      <label style={labelStyle}><span>{icon}</span> {label}</label>
                      <div style={{ position: 'relative' }}>
                        <input type="text" placeholder={placeholder} disabled
                          style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                        <span style={{
                          position: 'absolute', right: '14px', top: '50%',
                          transform: 'translateY(-50%)',
                          background: theme.accentMuted, color: theme.accentText,
                          fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px',
                          borderRadius: '100px'
                        }}>Coming Soon</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ACCOUNT SECTION */}
              {activeSection === 'account' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    background: theme.card, border: `1px solid ${theme.border}`,
                    borderRadius: '20px', padding: '28px',
                    display: 'flex', flexDirection: 'column', gap: '22px'
                  }}>
                    <div>
                      <p style={{ color: theme.text, fontWeight: '700', fontSize: '1rem', margin: '0 0 4px' }}>Account Settings</p>
                      <p style={{ color: theme.textMuted, fontSize: '0.82rem', margin: 0 }}>Manage your login credentials</p>
                    </div>
                    <div>
                      <label style={labelStyle}><span>📧</span> Email Address</label>
                      <input type="email" name="email" value={formData.email}
                        onChange={handleChange} placeholder="you@example.com"
                        style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                    <div style={{
                      background: theme.surface, border: `1px solid ${theme.border}`,
                      borderRadius: '12px', padding: '16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <div>
                        <p style={{ color: theme.textSecondary, fontSize: '0.875rem', fontWeight: '600', margin: '0 0 2px' }}>🔑 Password</p>
                        <p style={{ color: theme.textMuted, fontSize: '0.78rem', margin: 0 }}>Last changed: Never</p>
                      </div>
                      <button style={{
                        background: theme.surface, border: `1px solid ${theme.borderHover}`,
                        color: theme.textSecondary, borderRadius: '8px', padding: '7px 14px',
                        fontSize: '0.8rem', cursor: 'pointer', fontFamily: theme.font
                      }}>Change</button>
                    </div>
                  </div>

                  <div style={{
                    background: theme.dangerMuted, border: `1px solid ${theme.dangerBorder}`,
                    borderRadius: '20px', padding: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span>⚠️</span>
                      <p style={{ color: theme.danger, fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>Danger Zone</p>
                    </div>
                    <p style={{ color: theme.textMuted, fontSize: '0.82rem', margin: '0 0 16px' }}>
                      These actions are permanent and cannot be undone
                    </p>
                    <button style={{
                      background: theme.dangerMuted, border: `1px solid ${theme.dangerBorder}`,
                      color: theme.danger, borderRadius: '10px', padding: '10px 18px',
                      fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', fontFamily: theme.font
                    }}>🗑️ Delete Account</button>
                  </div>
                </div>
              )}

              {/* Bottom save */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button onClick={handleSubmit} disabled={loading} style={{
                  flex: 1, padding: '14px',
                  background: loading ? theme.accentMuted : `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                  color: loading ? theme.accentText : '#fff', fontWeight: '700',
                  border: 'none', borderRadius: '12px', fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: theme.font
                }}>
                  {loading ? '⏳ Saving changes...' : '✓ Save All Changes'}
                </button>
                <button onClick={() => navigate(`/profile/${user?.username}`)} style={{
                  padding: '14px 24px', background: theme.card,
                  border: `1px solid ${theme.border}`, color: theme.textSecondary,
                  borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600',
                  cursor: 'pointer', fontFamily: theme.font
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = theme.borderHover; e.currentTarget.style.color = theme.text }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
                >Cancel</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EditProfile