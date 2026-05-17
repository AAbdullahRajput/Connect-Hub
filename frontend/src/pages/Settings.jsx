import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LeftSidebar from '../components/LeftSidebar'
import { useTheme, themes } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const Settings = () => {
  const navigate = useNavigate()
  const { theme, themeName, setTheme } = useTheme()
  const { user } = useAuth()

  const fonts = [
    { key: 'inter', label: 'Inter', value: "'Inter', system-ui, sans-serif" },
    { key: 'georgia', label: 'Georgia', value: "'Georgia', serif" },
    { key: 'mono', label: 'Monospace', value: "'JetBrains Mono', monospace" },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bg,
      fontFamily: theme.font,
      color: theme.text
    }}>
      <Navbar />

      <div style={{
        display: 'flex',
        maxWidth: '1400px',
        margin: '0 auto',
        paddingTop: '64px'
      }}>
        <LeftSidebar />

        <main style={{
          flex: 1,
          marginLeft: '260px',
          padding: '32px',
          minHeight: 'calc(100vh - 64px)',
          maxWidth: '720px'
        }}>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              color: theme.text,
              fontSize: '1.5rem',
              fontWeight: '800',
              margin: '0 0 4px',
              letterSpacing: '-0.5px'
            }}>
              Settings
            </h1>
            <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
              Customize your ConnectHub experience
            </p>
          </div>

          {/* Theme section */}
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '28px',
            marginBottom: '20px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{
                color: theme.text,
                fontSize: '1rem',
                fontWeight: '700',
                margin: '0 0 4px'
              }}>
                Appearance
              </h2>
              <p style={{ color: theme.textMuted, fontSize: '0.82rem', margin: 0 }}>
                Choose a theme that suits your style
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px'
            }}>
              {Object.entries(themes).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  style={{
                    background: t.card,
                    border: `2px solid ${themeName === key ? t.accent : t.border}`,
                    borderRadius: '14px',
                    padding: '0',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    boxShadow: themeName === key
                      ? `0 0 0 4px ${t.accentMuted}`
                      : 'none',
                    fontFamily: theme.font,
                    textAlign: 'left'
                  }}
                >
                  {/* Preview bar */}
                  <div style={{
                    background: t.bg,
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '7px',
                      background: t.accent,
                      marginBottom: '4px'
                    }} />
                    <div style={{
                      width: '70%', height: '5px',
                      background: t.accent, borderRadius: '3px'
                    }} />
                    <div style={{
                      width: '90%', height: '4px',
                      background: t.border, borderRadius: '2px'
                    }} />
                    <div style={{
                      width: '55%', height: '4px',
                      background: t.border, borderRadius: '2px'
                    }} />
                  </div>

                  {/* Label */}
                  <div style={{
                    padding: '10px 14px',
                    borderTop: `1px solid ${t.border}`,
                    background: t.surface
                  }}>
                    <p style={{
                      color: t.text,
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      margin: '0 0 2px'
                    }}>
                      {t.name}
                    </p>
                    <p style={{
                      color: t.textMuted,
                      fontSize: '0.7rem',
                      margin: 0
                    }}>
                      {t.label}
                    </p>
                  </div>

                  {/* Active badge */}
                  {themeName === key && (
                    <div style={{
                      position: 'absolute',
                      top: '8px', right: '8px',
                      background: t.accent,
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '100px'
                    }}>
                      Active
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Current theme info */}
            <div style={{
              marginTop: '20px',
              padding: '14px 16px',
              background: theme.accentMuted,
              border: `1px solid ${theme.accentBorder}`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '9px',
                background: theme.accent,
                flexShrink: 0
              }} />
              <div>
                <p style={{
                  color: theme.text,
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  margin: '0 0 2px'
                }}>
                  {themes[themeName].name} is active
                </p>
                <p style={{ color: theme.textMuted, fontSize: '0.78rem', margin: 0 }}>
                  {themes[themeName].label} — saved automatically
                </p>
              </div>
              <span style={{
                marginLeft: 'auto',
                color: theme.success,
                fontSize: '18px'
              }}>✓</span>
            </div>
          </div>

          {/* Font preview */}
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '28px',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: theme.text,
              fontSize: '1rem',
              fontWeight: '700',
              margin: '0 0 4px'
            }}>
              Font Preview
            </h2>
            <p style={{
              color: theme.textMuted,
              fontSize: '0.82rem',
              margin: '0 0 16px'
            }}>
              Font is set by your active theme
            </p>

            <div style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              padding: '20px',
              fontFamily: theme.font
            }}>
              <p style={{
                color: theme.text,
                fontSize: '1.1rem',
                fontWeight: '700',
                margin: '0 0 6px'
              }}>
                The quick brown fox
              </p>
              <p style={{
                color: theme.textSecondary,
                fontSize: '0.9rem',
                margin: '0 0 12px',
                lineHeight: '1.6'
              }}>
                ConnectHub brings people together through real-time posts, stories and connections.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  background: theme.accentMuted,
                  border: `1px solid ${theme.accentBorder}`,
                  color: theme.accentText,
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  padding: '4px 10px',
                  borderRadius: '100px'
                }}>
                  Aa {themes[themeName].name}
                </span>
              </div>
            </div>
          </div>

          {/* Profile quick links */}
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '20px'
          }}>
            <h2 style={{
              color: theme.text,
              fontSize: '1rem',
              fontWeight: '700',
              margin: '0 0 16px'
            }}>
              Quick Links
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { label: '👤 Edit Profile', path: '/profile/edit' },
                { label: '🔍 Search', path: '/search' },
                { label: `📋 My Profile`, path: `/profile/${user?.username}` },
                { label: '🌍 Explore', path: '/explore' },
              ].map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    color: theme.textSecondary,
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: theme.font,
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = theme.accentMuted
                    e.currentTarget.style.color = theme.text
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = theme.textSecondary
                  }}
                >
                  <span>{label}</span>
                  <span style={{ color: theme.textHint }}>→</span>
                </button>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

export default Settings