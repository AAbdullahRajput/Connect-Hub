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
  const [activeSection, setActiveSection] = useState('profile')
  const [coverHovered, setCoverHovered] = useState(false)
  const [avatarHovered, setAvatarHovered] = useState(false)

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
  }

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
      const res = await updateProfile(formData)
      updateUser({
        ...user, ...res.data.user,
        profile_picture: avatarFile ? avatarPreview : user?.profile_picture,
        cover_photo: coverFile ? coverPreview : user?.cover_photo,
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
    width: '100%', backgroundColor: '#18181b',
    border: '1px solid #27272a', color: '#fff',
    borderRadius: '12px', padding: '13px 16px',
    fontSize: '0.9rem', outline: 'none',
    boxSizing: 'border-box', transition: 'all 0.2s',
    fontFamily: "'Inter', system-ui, sans-serif"
  }

  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: '6px',
    color: '#71717a', fontSize: '0.72rem', fontWeight: '700',
    marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px'
  }

  const focusIn = (e) => {
    e.target.style.borderColor = '#2563EB'
    e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)'
    e.target.style.backgroundColor = '#1c1c1f'
  }
  const focusOut = (e) => {
    e.target.style.borderColor = '#27272a'
    e.target.style.boxShadow = 'none'
    e.target.style.backgroundColor = '#18181b'
  }

  const sections = [
    { id: 'profile', label: 'Profile Info', icon: '👤' },
    { id: 'photos', label: 'Photos', icon: '📷' },
    { id: 'account', label: 'Account', icon: '⚙️' },
  ]

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#000',
      fontFamily: "'Inter', system-ui, sans-serif", color: '#fff'
    }}>
      <Navbar />
      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', paddingTop: '64px' }}>
        <LeftSidebar />

        <main style={{
          flex: 1, marginLeft: '260px',
          padding: '32px', minHeight: 'calc(100vh - 64px)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <button onClick={() => navigate(`/profile/${user?.username}`)} style={{
              background: '#18181b', border: '1px solid #27272a',
              color: '#a1a1aa', borderRadius: '10px', padding: '8px 16px',
              cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#a1a1aa' }}
            >
              ← Back
            </button>
            <div>
              <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', margin: '0 0 2px', letterSpacing: '-0.5px' }}>
                Edit Profile
              </h1>
              <p style={{ color: '#52525b', fontSize: '0.85rem', margin: 0 }}>
                Manage your public profile information
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', maxWidth: '860px' }}>

            {/* Section tabs */}
            <div style={{
              width: '188px', flexShrink: 0,
              background: '#18181b', border: '1px solid #27272a',
              borderRadius: '16px', padding: '8px',
              position: 'sticky', top: '88px'
            }}>
              <p style={{
                color: '#3f3f50', fontSize: '0.65rem', fontWeight: '700',
                letterSpacing: '1px', textTransform: 'uppercase',
                padding: '8px 12px 6px', margin: 0
              }}>Settings</p>
              {sections.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 12px', borderRadius: '10px', border: 'none',
                  background: activeSection === s.id ? 'rgba(37,99,235,0.15)' : 'transparent',
                  color: activeSection === s.id ? '#60a5fa' : '#71717a',
                  fontSize: '0.875rem', fontWeight: activeSection === s.id ? '700' : '500',
                  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                  textAlign: 'left', marginBottom: '2px'
                }}
                  onMouseEnter={e => { if (activeSection !== s.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if (activeSection !== s.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: '16px' }}>{s.icon}</span>
                  <span>{s.label}</span>
                  {activeSection === s.id && (
                    <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB' }} />
                  )}
                </button>
              ))}

              {/* Save button in sidebar */}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #27272a' }}>
                <button onClick={handleSubmit} disabled={loading} style={{
                  width: '100%', padding: '11px',
                  background: loading ? '#1e3a6e' : 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                  color: '#fff', fontWeight: '700', border: 'none',
                  borderRadius: '10px', fontSize: '0.875rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.8 : 1, fontFamily: 'inherit',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
                  transition: 'all 0.2s'
                }}>
                  {loading ? '⏳ Saving...' : '✓ Save Changes'}
                </button>
              </div>
            </div>

            {/* Form content */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Alerts */}
              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '12px', padding: '14px 16px', marginBottom: '20px',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <span>⚠️</span>
                  <span style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</span>
                </div>
              )}
              {success && (
                <div style={{
                  background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: '12px', padding: '14px 16px', marginBottom: '20px',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <span>✅</span>
                  <span style={{ color: '#22c55e', fontSize: '0.875rem' }}>{success}</span>
                </div>
              )}

              {/* ── PHOTOS ── */}
              {activeSection === 'photos' && (
                <div style={{
                  background: '#18181b', border: '1px solid #27272a',
                  borderRadius: '20px', overflow: 'hidden'
                }}>
                  {/* Cover */}
                  <div
                    onMouseEnter={() => setCoverHovered(true)}
                    onMouseLeave={() => setCoverHovered(false)}
                    style={{ position: 'relative', height: '200px', cursor: 'pointer' }}
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        background: 'linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(124,58,237,0.2) 50%, #18181b 100%)'
                      }} />
                    )}
                    <label style={{
                      position: 'absolute', inset: 0,
                      background: coverHovered ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.25)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '10px',
                      cursor: 'pointer', transition: 'background 0.2s'
                    }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        background: coverHovered ? 'rgba(37,99,235,0.8)' : 'rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', transition: 'all 0.2s',
                        border: '2px solid rgba(255,255,255,0.2)'
                      }}>📷</div>
                      <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
                        {coverPreview ? 'Change Cover Photo' : 'Upload Cover Photo'}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>
                        Recommended 1500×500px · JPG or PNG
                      </span>
                      <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
                    </label>
                  </div>

                  {/* Avatar */}
                  <div style={{ padding: '28px' }}>
                    <p style={labelStyle}>Profile Picture</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div
                        onMouseEnter={() => setAvatarHovered(true)}
                        onMouseLeave={() => setAvatarHovered(false)}
                        style={{ position: 'relative', flexShrink: 0 }}
                      >
                        <div style={{
                          width: '96px', height: '96px', borderRadius: '50%',
                          overflow: 'hidden',
                          border: avatarHovered ? '3px solid #2563EB' : '3px solid rgba(37,99,235,0.3)',
                          background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '32px', fontWeight: '700',
                          transition: 'border-color 0.2s',
                          boxShadow: avatarHovered ? '0 0 0 4px rgba(37,99,235,0.2)' : 'none'
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
                        <p style={{ color: '#e4e4e7', fontWeight: '700', fontSize: '1rem', margin: '0 0 2px' }}>{user?.name}</p>
                        <p style={{ color: '#52525b', fontSize: '0.85rem', margin: '0 0 16px' }}>@{user?.username}</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <label style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)',
                            color: '#60a5fa', borderRadius: '10px', padding: '8px 16px',
                            fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.2)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.1)' }}
                          >
                            📷 Upload Photo
                            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                          </label>
                          {avatarPreview && (
                            <button onClick={() => { setAvatarFile(null); setAvatarPreview(null) }} style={{
                              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                              color: '#f87171', borderRadius: '10px', padding: '8px 16px',
                              fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
                            }}>
                              🗑️ Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PROFILE INFO ── */}
              {activeSection === 'profile' && (
                <div style={{
                  background: '#18181b', border: '1px solid #27272a',
                  borderRadius: '20px', padding: '28px',
                  display: 'flex', flexDirection: 'column', gap: '22px'
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    paddingBottom: '20px', borderBottom: '1px solid #27272a'
                  }}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" style={{
                        width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover',
                        border: '2px solid rgba(37,99,235,0.3)'
                      }} />
                    ) : (
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '18px', fontWeight: '700'
                      }}>{user?.name?.[0]?.toUpperCase()}</div>
                    )}
                    <div>
                      <p style={{ color: '#fff', fontWeight: '700', fontSize: '1rem', margin: '0 0 2px' }}>{user?.name}</p>
                      <p style={{ color: '#52525b', fontSize: '0.82rem', margin: 0 }}>@{user?.username}</p>
                    </div>
                    <button onClick={() => setActiveSection('photos')} style={{
                      marginLeft: 'auto', background: 'rgba(37,99,235,0.1)',
                      border: '1px solid rgba(37,99,235,0.25)', color: '#60a5fa',
                      borderRadius: '8px', padding: '7px 12px', fontSize: '0.78rem',
                      fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
                    }}>
                      📷 Change Photo
                    </button>
                  </div>

                  <div>
                    <label style={labelStyle}><span>👤</span> Full Name</label>
                    <input
                      type="text" name="name" value={formData.name}
                      onChange={handleChange} placeholder="Your full name"
                      style={inputStyle} onFocus={focusIn} onBlur={focusOut}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}><span>@</span> Username</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute', left: '16px', top: '50%',
                        transform: 'translateY(-50%)', color: '#2563EB',
                        fontWeight: '700', pointerEvents: 'none'
                      }}>@</span>
                      <input
                        type="text" name="username" value={formData.username}
                        onChange={handleChange} placeholder="yourhandle"
                        style={{ ...inputStyle, paddingLeft: '32px' }}
                        onFocus={focusIn} onBlur={focusOut}
                      />
                    </div>
                    <p style={{ color: '#3f3f50', fontSize: '0.72rem', marginTop: '6px' }}>
                      This is your unique public handle on ConnectHub
                    </p>
                  </div>

                  <div>
                    <label style={labelStyle}><span>📝</span> Bio</label>
                    <textarea
                      name="bio" value={formData.bio}
                      onChange={handleChange} rows={4}
                      placeholder="Tell the world about yourself..."
                      style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
                      onFocus={focusIn} onBlur={focusOut}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <p style={{ color: '#3f3f50', fontSize: '0.72rem', margin: 0 }}>
                        A short bio that appears on your profile
                      </p>
                      <p style={{
                        color: formData.bio.length > 150 ? '#f87171' : '#3f3f50',
                        fontSize: '0.72rem', margin: 0
                      }}>
                        {formData.bio.length}/160
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ACCOUNT ── */}
              {activeSection === 'account' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    background: '#18181b', border: '1px solid #27272a',
                    borderRadius: '20px', padding: '28px',
                    display: 'flex', flexDirection: 'column', gap: '22px'
                  }}>
                    <div>
                      <p style={{ color: '#fff', fontWeight: '700', fontSize: '1rem', margin: '0 0 4px' }}>
                        Account Settings
                      </p>
                      <p style={{ color: '#52525b', fontSize: '0.82rem', margin: 0 }}>
                        Manage your login credentials
                      </p>
                    </div>

                    <div>
                      <label style={labelStyle}><span>📧</span> Email Address</label>
                      <input
                        type="email" name="email" value={formData.email}
                        onChange={handleChange} placeholder="you@example.com"
                        style={inputStyle} onFocus={focusIn} onBlur={focusOut}
                      />
                      <p style={{ color: '#3f3f50', fontSize: '0.72rem', marginTop: '6px' }}>
                        Used for login and important notifications
                      </p>
                    </div>

                    <div style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid #27272a',
                      borderRadius: '12px', padding: '16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <div>
                        <p style={{ color: '#d4d4d8', fontSize: '0.875rem', fontWeight: '600', margin: '0 0 2px' }}>
                          🔑 Password
                        </p>
                        <p style={{ color: '#52525b', fontSize: '0.78rem', margin: 0 }}>
                          Last changed: Never
                        </p>
                      </div>
                      <button style={{
                        background: '#27272a', border: '1px solid #3f3f46',
                        color: '#a1a1aa', borderRadius: '8px',
                        padding: '7px 14px', fontSize: '0.8rem',
                        cursor: 'pointer', fontFamily: 'inherit'
                      }}>
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Danger zone */}
                  <div style={{
                    background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: '20px', padding: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '16px' }}>⚠️</span>
                      <p style={{ color: '#f87171', fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>
                        Danger Zone
                      </p>
                    </div>
                    <p style={{ color: '#52525b', fontSize: '0.82rem', margin: '0 0 16px' }}>
                      These actions are permanent and cannot be undone
                    </p>
                    <button style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                      color: '#f87171', borderRadius: '10px', padding: '10px 18px',
                      fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.2s'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                    >
                      🗑️ Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom save */}
              <div style={{
                display: 'flex', gap: '12px', marginTop: '20px'
              }}>
                <button onClick={handleSubmit} disabled={loading} style={{
                  flex: 1, padding: '14px',
                  background: loading ? '#1e3a6e' : 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                  color: '#fff', fontWeight: '700', border: 'none',
                  borderRadius: '12px', fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.8 : 1, fontFamily: 'inherit',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(37,99,235,0.3)',
                  transition: 'all 0.2s'
                }}>
                  {loading ? '⏳ Saving changes...' : '✓ Save All Changes'}
                </button>
                <button onClick={() => navigate(`/profile/${user?.username}`)} style={{
                  padding: '14px 24px', background: '#18181b',
                  border: '1px solid #27272a', color: '#a1a1aa',
                  borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#a1a1aa' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EditProfile