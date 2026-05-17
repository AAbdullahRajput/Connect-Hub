import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../api/axios'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginUser(formData)
      login(res.data.user, res.data.token)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex',
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: '#000', overflow: 'hidden', position: 'fixed',
      top: 0, left: 0
    }}>

      {/* ═══ LEFT PANEL ═══ */}
      <div style={{
        flex: 1, height: '100vh', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #060610 0%, #0a0a18 40%, #050510 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '60px 56px'
      }}>

        {/* Animated background orbs */}
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          borderRadius: '50%', top: '-150px', left: '-150px',
          background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0.05) 40%, transparent 70%)',
          pointerEvents: 'none', animation: 'pulse 4s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: '350px', height: '350px',
          borderRadius: '50%', bottom: '-80px', right: '-80px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', width: '200px', height: '200px',
          borderRadius: '50%', top: '40%', right: '15%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Grid lines decoration */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px', pointerEvents: 'none'
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>

          {/* Logo */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-1px',
                boxShadow: '0 8px 32px rgba(37,99,235,0.4)'
              }}>C</div>
              <h1 style={{
                fontSize: '2.4rem', fontWeight: '800', color: '#fff',
                margin: 0, letterSpacing: '-1.5px',
                textShadow: '0 0 40px rgba(255,255,255,0.1)'
              }}>
                Connect<span style={{ color: '#2563EB' }}>Hub</span>
              </h1>
            </div>
            <p style={{ color: '#4a4a5a', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '340px' }}>
              The social platform built for real connections. Share moments, build communities.
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '48px' }}>
            {[
              { num: '10K+', label: 'Active Users', icon: '👥' },
              { num: '50K+', label: 'Posts Shared', icon: '📝' },
              { num: '99.9%', label: 'Uptime', icon: '⚡' },
            ].map(({ num, label, icon }) => (
              <div key={label} style={{
                flex: 1, background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '16px 14px', textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{icon}</div>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.5px' }}>{num}</div>
                <div style={{ color: '#3f3f50', fontSize: '0.72rem', marginTop: '2px', fontWeight: '500' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '🔥', title: 'Real-time feed', desc: 'See posts and reactions as they happen' },
              { icon: '🌍', title: 'Global community', desc: 'Connect with people worldwide' },
              { icon: '🔒', title: 'Private & secure', desc: 'Your data is always protected' },
              { icon: '📱', title: 'Available everywhere', desc: 'Web app + mobile APK included' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
                }}>{icon}</div>
                <div>
                  <div style={{ color: '#d4d4d8', fontSize: '0.875rem', fontWeight: '600' }}>{title}</div>
                  <div style={{ color: '#3f3f50', fontSize: '0.78rem', marginTop: '1px' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom badge */}
          <div style={{
            marginTop: '48px', display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)',
            borderRadius: '100px', padding: '8px 16px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#6b8fd4', fontSize: '0.78rem', fontWeight: '500' }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div style={{
        width: '500px', minWidth: '500px', height: '100vh',
        background: '#09090b', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 56px',
        borderLeft: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto'
      }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '100px', padding: '5px 12px', marginBottom: '20px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: '500' }}>Secure connection</span>
          </div>
          <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Welcome back 👋
          </h2>
          <p style={{ color: '#52525b', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Sign in to your ConnectHub account to continue
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: '#71717a', fontSize: '0.78rem', fontWeight: '600',
              marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px'
            }}>
              <span>📧</span> Email Address
            </label>
            <input
              type="email" name="email" value={formData.email}
              onChange={handleChange} required
              placeholder="you@example.com"
              onFocus={focusStyle} onBlur={blurStyle}
              style={{
                width: '100%', backgroundColor: '#18181b',
                border: '1px solid #27272a', color: '#fff',
                borderRadius: '12px', padding: '14px 18px',
                fontSize: '0.95rem', outline: 'none',
                boxSizing: 'border-box', transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                color: '#71717a', fontSize: '0.78rem', fontWeight: '600',
                textTransform: 'uppercase', letterSpacing: '0.8px'
              }}>
                <span>🔑</span> Password
              </label>
              <span style={{ color: '#2563EB', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '500' }}>
                Forgot password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                name="password" value={formData.password}
                onChange={handleChange} required
                placeholder="••••••••"
                onFocus={focusStyle} onBlur={blurStyle}
                style={{
                  width: '100%', backgroundColor: '#18181b',
                  border: '1px solid #27272a', color: '#fff',
                  borderRadius: '12px', padding: '14px 48px 14px 18px',
                  fontSize: '0.95rem', outline: 'none',
                  boxSizing: 'border-box', transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
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

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            width: '100%',
            background: loading
              ? '#1e3a6e'
              : 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 50%, #1e40af 100%)',
            color: '#fff', fontWeight: '700', padding: '15px',
            borderRadius: '12px', border: 'none', fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.8 : 1, transition: 'all 0.2s',
            letterSpacing: '0.3px', fontFamily: 'inherit',
            boxShadow: loading ? 'none' : '0 8px 32px rgba(37,99,235,0.35)',
            marginBottom: '20px'
          }}
            onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
          >
            {loading ? '⏳ Signing you in...' : 'Sign In →'}
          </button>

        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #27272a)' }} />
          <span style={{ color: '#3f3f46', fontSize: '0.8rem', fontWeight: '500' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #27272a, transparent)' }} />
        </div>

        {/* Google button */}
        <button style={{
          width: '100%', background: 'transparent',
          border: '1px solid #27272a', color: '#a1a1aa',
          borderRadius: '12px', padding: '13px', fontSize: '0.9rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '10px', fontFamily: 'inherit',
          transition: 'all 0.2s', marginBottom: '32px'
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.background = '#18181b' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.background = 'transparent' }}
        >
          🌐 <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#52525b', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{
              color: '#2563EB', fontWeight: '600', textDecoration: 'none'
            }}>
              Create one free →
            </Link>
          </p>
        </div>

        {/* Bottom trust badges */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '20px',
          marginTop: '40px', paddingTop: '24px',
          borderTop: '1px solid #18181b'
        }}>
          {['🔒 Encrypted', '🛡️ Private', '✅ Verified'].map(badge => (
            <span key={badge} style={{ color: '#3f3f46', fontSize: '0.72rem', fontWeight: '500' }}>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Login