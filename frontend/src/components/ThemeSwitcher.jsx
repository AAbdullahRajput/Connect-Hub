import { useTheme } from '../context/ThemeContext'

const ThemeSwitcher = () => {
  const { theme, themeName, setTheme, themes } = useTheme()

  return (
    <div style={{
      background: theme.card,
      border: `1px solid ${theme.border}`,
      borderRadius: '16px',
      padding: '16px',
      fontFamily: theme.font
    }}>
      <p style={{
        color: theme.textMuted, fontSize: '0.68rem', fontWeight: '700',
        letterSpacing: '1px', textTransform: 'uppercase',
        margin: '0 0 12px'
      }}>
        Theme
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Object.entries(themes).map(([key, t]) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px', border: 'none',
              background: themeName === key ? theme.accentMuted : 'transparent',
              cursor: 'pointer', fontFamily: theme.font,
              transition: 'all 0.2s', width: '100%', textAlign: 'left'
            }}
            onMouseEnter={e => { if (themeName !== key) e.currentTarget.style.background = theme.accentMuted + '80' }}
            onMouseLeave={e => { if (themeName !== key) e.currentTarget.style.background = 'transparent' }}
          >
            {/* Color dot */}
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: t.avatarGradient, flexShrink: 0,
              border: themeName === key ? `2px solid ${t.accent}` : '2px solid transparent',
              transition: 'border-color 0.2s'
            }} />
            <div>
              <div style={{
                color: themeName === key ? theme.accentText : theme.textSecondary,
                fontSize: '0.875rem', fontWeight: '600'
              }}>{t.name}</div>
              <div style={{ color: theme.textMuted, fontSize: '0.72rem' }}>{t.label}</div>
            </div>
            {themeName === key && (
              <span style={{ marginLeft: 'auto', color: theme.accentText, fontSize: '14px' }}>✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ThemeSwitcher