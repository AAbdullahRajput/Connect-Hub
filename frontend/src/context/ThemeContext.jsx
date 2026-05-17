import { createContext, useContext, useState, useEffect } from 'react'

export const themes = {
  midnight: {
    name: 'Midnight',
    label: 'Dark · Blue',
    bg: '#000000',
    surface: '#09090b',
    card: '#18181b',
    border: '#27272a',
    borderHover: '#3f3f46',
    text: '#ffffff',
    textSecondary: '#a1a1aa',
    textMuted: '#52525b',
    textHint: '#3f3f46',
    accent: '#2563EB',
    accentHover: '#1d4ed8',
    accentMuted: 'rgba(37,99,235,0.15)',
    accentBorder: 'rgba(37,99,235,0.3)',
    accentText: '#60a5fa',
    danger: '#f87171',
    dangerMuted: 'rgba(239,68,68,0.08)',
    dangerBorder: 'rgba(239,68,68,0.25)',
    success: '#22c55e',
    successMuted: 'rgba(34,197,94,0.08)',
    avatarGradient: 'linear-gradient(135deg, #2563EB, #7c3aed)',
    navbarBg: 'rgba(0,0,0,0.85)',
    font: "'Inter', system-ui, sans-serif",
  },
  parchment: {
    name: 'Parchment',
    label: 'Light · Purple',
    bg: '#f8f7f4',
    surface: '#f1f0ec',
    card: '#ffffff',
    border: '#e7e5e4',
    borderHover: '#d6d3d1',
    text: '#1c1917',
    textSecondary: '#57534e',
    textMuted: '#a8a29e',
    textHint: '#d6d3d1',
    accent: '#7c3aed',
    accentHover: '#6d28d9',
    accentMuted: 'rgba(124,58,237,0.1)',
    accentBorder: 'rgba(124,58,237,0.3)',
    accentText: '#7c3aed',
    danger: '#dc2626',
    dangerMuted: 'rgba(220,38,38,0.06)',
    dangerBorder: 'rgba(220,38,38,0.2)',
    success: '#16a34a',
    successMuted: 'rgba(22,163,74,0.08)',
    avatarGradient: 'linear-gradient(135deg, #7c3aed, #db2777)',
    navbarBg: 'rgba(248,247,244,0.9)',
    font: "'Georgia', 'Times New Roman', serif",
  },
  forest: {
    name: 'Forest',
    label: 'Dark · Green',
    bg: '#0d1117',
    surface: '#161b22',
    card: '#21262d',
    border: '#30363d',
    borderHover: '#484f58',
    text: '#e6edf3',
    textSecondary: '#8b949e',
    textMuted: '#484f58',
    textHint: '#30363d',
    accent: '#22c55e',
    accentHover: '#16a34a',
    accentMuted: 'rgba(34,197,94,0.12)',
    accentBorder: 'rgba(34,197,94,0.3)',
    accentText: '#4ade80',
    danger: '#f85149',
    dangerMuted: 'rgba(248,81,73,0.08)',
    dangerBorder: 'rgba(248,81,73,0.25)',
    success: '#3fb950',
    successMuted: 'rgba(63,185,80,0.08)',
    avatarGradient: 'linear-gradient(135deg, #22c55e, #0ea5e9)',
    navbarBg: 'rgba(13,17,23,0.9)',
    font: "'JetBrains Mono', 'Fira Code', monospace",
  },
  aurora: {
    name: 'Aurora',
    label: 'Dark · Pink',
    bg: '#1a0a2e',
    surface: '#2d1b4e',
    card: '#3d2460',
    border: '#4a2d6b',
    borderHover: '#6b3f8f',
    text: '#f8f0ff',
    textSecondary: '#c4a8e0',
    textMuted: '#7c5a9e',
    textHint: '#4a2d6b',
    accent: '#f472b6',
    accentHover: '#ec4899',
    accentMuted: 'rgba(244,114,182,0.15)',
    accentBorder: 'rgba(244,114,182,0.35)',
    accentText: '#f9a8d4',
    danger: '#fb7185',
    dangerMuted: 'rgba(251,113,133,0.1)',
    dangerBorder: 'rgba(251,113,133,0.3)',
    success: '#34d399',
    successMuted: 'rgba(52,211,153,0.1)',
    avatarGradient: 'linear-gradient(135deg, #f472b6, #a855f7)',
    navbarBg: 'rgba(26,10,46,0.9)',
    font: "'Inter', system-ui, sans-serif",
  },
}

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(
    () => localStorage.getItem('ch_theme') || 'midnight'
  )

  const theme = themes[themeName] || themes.midnight

  useEffect(() => {
    localStorage.setItem('ch_theme', themeName)
    document.body.style.backgroundColor = theme.bg
    document.body.style.fontFamily = theme.font
  }, [themeName, theme])

  const setTheme = (name) => {
    if (themes[name]) setThemeName(name)
  }

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

export default ThemeContext