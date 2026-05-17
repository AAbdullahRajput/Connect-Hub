import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { registerUser } from '../api/axios'

const Signup = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', password: '', confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const focusStyle = (e) => {
    e.target.style.borderColor = '#2563EB'
    e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)'
    e.target.style.backgroundColor = '#1c1c1f'
  }
  const blurStyle = (e) => {
    e.target.style.borderColor = '#27272a'
    e.target.style.boxShadow = 'none'
    e.target.style.backgroundColor = '#18181b'
  }

  const validateStep1 = () => {
    if (!formData.name.trim()) { setError('Full name is required'); return false }
    if (!formData.username.trim()) { setError('Username is required'); return false }
    if (formData.username.includes(' ')) { setError('Username cannot have spaces'); return false }
    setError('')
    return true
  }

  const handleNext = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters'); return
    }
    setLoading(true)
    try {
      const res = await registerUser({
        name: formData.name, username: formData.username,
        email: formData.email, password: formData.password
      })
      login(res.data.user, res.data.token)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', backgroundColor: '#18181b',
    border: '1px solid #27272a', color: '#fff',
    borderRadius: '12px', padding: '14px 18px',
    fontSize: '0.95rem', outline: 'none',
    boxSizing: 'border-box', transition: 'all 0.2s',
    fontFamily: 'inherit'
  }

  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: '6px',
    color: '#71717a', fontSize: '0.78rem', fontWeight: '600',
    marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px'
  }

  const strengthColor = () => {
    const p = formData.password
    if (!p) return '#27272a'
    if (p.length < 4) return '#ef4444'
    if (p.length < 6) return '#f97316'
    if (p.length < 10) return '#eab308'
    return '#22c55e'
  }

  const strengthLabel = () => {
    const p = formData.password
    if (!p) return ''
    if (p.length < 4) return 'Weak'
    if (p.length < 6) return 'Fair'
    if (p.length < 10) return 'Good'
    return 'Strong 💪'
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex',
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: '#000', overflow: 'hidden',
      position: 'fixed', top: 0, left: 0
    }}>

      {/* ═══ LEFT PANEL ═══ */}
      <div style={{
        flex: 1, height: '100vh', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #060610 0%, #0a0a18 40%, #050510 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '60px 56px'
      }}>

        {/* Orbs */}
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          borderRadius: '50%', top: '-150px', left: '-150px',
          background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', width: '300px', height: '300px',
          borderRadius: '50%', bottom: '-60px', right: '-60px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px', pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '11px',
              background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: '800', color: '#fff',
              boxShadow: '0 8px 32px rgba(37,99,235,0.4)'
            }}>C</div>
            <h1 style={{
              fontSize: '2.2rem', fontWeight: '800', color: '#fff',
              margin: 0, letterSpacing: '-1.5px'
            }}>
              Connect<span style={{ color: '#2563EB' }}>Hub</span>
            </h1>
          </div>

          <p style={{ color: '#4a4a5a', fontSize: '1rem', marginBottom: '48px', lineHeight: '1.6' }}>
            Your social world starts here. Join thousands already connected.
          </p>

          {/* Step progress */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '28px' }}>
              {[1, 2, 3].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: '700',
                    background: step >= s
                      ? 'linear-gradient(135deg, #2563EB, #1d4ed8)'
                      : 'rgba(255,255,255,0.05)',
                    border: step >= s
                      ? 'none'
                      : '1px solid rgba(255,255,255,0.1)',
                    color: step >= s ? '#fff' : '#3f3f50',
                    boxShadow: step >= s ? '0 4px 16px rgba(37,99,235,0.4)' : 'none',
                    transition: 'all 0.3s'
                  }}>
                    {step > s ? '✓' : s}
                  </div>
                  {i < 2 && (
                    <div style={{
                      flex: 1, height: '2px', margin: '0 6px',
                      background: step > s
                        ? 'linear-gradient(90deg, #2563EB, #1d4ed8)'
                        : 'rgba(255,255,255,0.08)',
                      transition: 'all 0.3s'
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Step details */}
            {[
              { title: 'Your identity', desc: 'Name and unique username', icon: '👤' },
              { title: 'Contact & security', desc: 'Email and strong password', icon: '🔐' },
              { title: 'All set!', desc: 'Start exploring ConnectHub', icon: '🎉' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                marginBottom: '16px', opacity: step === i + 1 ? 1 : 0.35,
                transition: 'opacity 0.3s'
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  background: step === i + 1
                    ? 'rgba(37,99,235,0.15)'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${step === i + 1 ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', transition: 'all 0.3s'
                }}>{s.icon}</div>
                <div>
                  <div style={{
                    color: step === i + 1 ? '#e4e4e7' : '#52525b',
                    fontSize: '0.9rem', fontWeight: '600', transition: 'color 0.3s'
                  }}>{s.title}</div>
                  <div style={{ color: '#3f3f50', fontSize: '0.78rem', marginTop: '2px' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px', padding: '18px 20px'
          }}>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
              {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#f59e0b', fontSize: '14px' }}>★</span>)}
            </div>
            <p style={{ color: '#71717a', fontSize: '0.825rem', lineHeight: '1.6', fontStyle: 'italic' }}>
              "ConnectHub completely changed how I stay in touch with my community. The real-time features are incredible!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700', color: '#fff'
              }}>S</div>
              <div>
                <div style={{ color: '#d4d4d8', fontSize: '0.78rem', fontWeight: '600' }}>Sarah K.</div>
                <div style={{ color: '#3f3f50', fontSize: '0.7rem' }}>@sarah_creates</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div style={{
        width: '520px', minWidth: '520px', height: '100vh',
        background: '#09090b', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 56px',
        borderLeft: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto'
      }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
            borderRadius: '100px', padding: '5px 12px', marginBottom: '18px'
          }}>
            <span style={{ fontSize: '10px' }}>✨</span>
            <span style={{ color: '#6b8fd4', fontSize: '0.75rem', fontWeight: '500' }}>
              Step {step} of 2 — {step === 1 ? 'Basic info' : 'Credentials'}
            </span>
          </div>

          <h2 style={{
            color: '#fff', fontSize: '1.9rem', fontWeight: '800',
            margin: '0 0 8px', letterSpacing: '-0.5px'
          }}>
            {step === 1 ? 'Create your account' : 'Set your credentials'}
          </h2>
          <p style={{ color: '#52525b', fontSize: '0.9rem', lineHeight: '1.6' }}>
            {step === 1
              ? 'Choose your name and a unique username'
              : 'Your email and a strong password'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px', padding: '14px 16px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</span>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}><span>👤</span> Full Name</label>
              <input
                type="text" name="name" value={formData.name}
                onChange={handleChange} placeholder="Abdullah Rajput"
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}><span>@</span> Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '18px', top: '50%',
                  transform: 'translateY(-50%)', color: '#2563EB',
                  fontSize: '0.95rem', fontWeight: '600', pointerEvents: 'none'
                }}>@</span>
                <input
                  type="text" name="username" value={formData.username}
                  onChange={handleChange} placeholder="abdullahrajput"
                  style={{ ...inputStyle, paddingLeft: '34px' }}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
              </div>
              <p style={{ color: '#3f3f46', fontSize: '0.75rem', marginTop: '6px' }}>
                This will be your public @handle on ConnectHub
              </p>
            </div>

            {/* Username preview */}
            {formData.username && (
              <div style={{
                background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
                borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: '700', fontSize: '14px'
                }}>
                  {formData.name ? formData.name[0].toUpperCase() : '?'}
                </div>
                <div>
                  <div style={{ color: '#e4e4e7', fontSize: '0.875rem', fontWeight: '600' }}>
                    {formData.name || 'Your Name'}
                  </div>
                  <div style={{ color: '#2563EB', fontSize: '0.78rem' }}>
                    @{formData.username}
                  </div>
                </div>
                <span style={{ marginLeft: 'auto', color: '#22c55e', fontSize: '12px', fontWeight: '600' }}>
                  ✓ Available
                </span>
              </div>
            )}

            <button onClick={handleNext} style={{
              width: '100%',
              background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 50%, #1e40af 100%)',
              color: '#fff', fontWeight: '700', padding: '15px',
              borderRadius: '12px', border: 'none', fontSize: '1rem',
              cursor: 'pointer', letterSpacing: '0.3px', fontFamily: 'inherit',
              boxShadow: '0 8px 32px rgba(37,99,235,0.35)', transition: 'all 0.2s'
            }}
              onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}><span>📧</span> Email Address</label>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} required placeholder="you@example.com"
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={labelStyle}><span>🔑</span> Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password" value={formData.password}
                  onChange={handleChange} required placeholder="Min 6 characters"
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: '#52525b', cursor: 'pointer', fontSize: '16px'
                }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Password strength */}
            {formData.password && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1,2,3,4].map(s => (
                    <div key={s} style={{
                      flex: 1, height: '3px', borderRadius: '2px',
                      background: formData.password.length >= s * 2.5
                        ? strengthColor() : '#27272a',
                      transition: 'background 0.3s'
                    }} />
                  ))}
                </div>
                <span style={{ color: strengthColor(), fontSize: '0.72rem', fontWeight: '600' }}>
                  {strengthLabel()}
                </span>
              </div>
            )}

            <div style={{ marginBottom: '28px' }}>
              <label style={labelStyle}><span>🔒</span> Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleChange} required placeholder="Repeat your password"
                  style={{
                    ...inputStyle, paddingRight: '48px',
                    borderColor: formData.confirmPassword && formData.confirmPassword !== formData.password
                      ? '#ef4444' : '#27272a'
                  }}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: '#52525b', cursor: 'pointer', fontSize: '16px'
                }}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.confirmPassword && formData.confirmPassword === formData.password && (
                <p style={{ color: '#22c55e', fontSize: '0.72rem', marginTop: '6px', fontWeight: '500' }}>
                  ✓ Passwords match
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button type="button" onClick={() => { setStep(1); setError('') }} style={{
                flex: '0 0 auto', background: '#18181b',
                border: '1px solid #27272a', color: '#a1a1aa',
                borderRadius: '12px', padding: '15px 20px', fontSize: '0.9rem',
                cursor: 'pointer', fontFamily: 'inherit'
              }}>← Back</button>

              <button type="submit" disabled={loading} style={{
                flex: 1,
                background: loading
                  ? '#1e3a6e'
                  : 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 50%, #1e40af 100%)',
                color: '#fff', fontWeight: '700', padding: '15px',
                borderRadius: '12px', border: 'none', fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1, fontFamily: 'inherit',
                boxShadow: loading ? 'none' : '0 8px 32px rgba(37,99,235,0.35)',
                transition: 'all 0.2s'
              }}>
                {loading ? '⏳ Creating account...' : '🚀 Create Account'}
              </button>
            </div>

            <p style={{ color: '#3f3f46', fontSize: '0.75rem', textAlign: 'center', lineHeight: '1.5' }}>
              By creating an account you agree to our{' '}
              <span style={{ color: '#2563EB', cursor: 'pointer' }}>Terms of Service</span>
              {' '}and{' '}
              <span style={{ color: '#2563EB', cursor: 'pointer' }}>Privacy Policy</span>
            </p>
          </form>
        )}

        {/* Footer link */}
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <p style={{ color: '#52525b', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>
              Sign in →
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '20px',
          marginTop: '32px', paddingTop: '20px',
          borderTop: '1px solid #18181b'
        }}>
          {['🔒 Encrypted', '🛡️ GDPR Safe', '✅ Free Forever'].map(badge => (
            <span key={badge} style={{ color: '#3f3f46', fontSize: '0.72rem', fontWeight: '500' }}>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Signup