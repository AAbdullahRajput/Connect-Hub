import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import PostDetails from './pages/PostDetails'
import Search from './pages/Search'
import Followers from './pages/Followers'
import Settings from './pages/Settings'

const SplashLoader = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#09090B',
    gap: '16px',
  }}>
    <img src="/logo192.png" alt="ConnectHub" width={80} height={80}
      style={{ borderRadius: '20px' }} />
    <div style={{
      fontSize: '28px',
      fontWeight: '800',
      letterSpacing: '-1px',
      fontFamily: 'sans-serif',
    }}>
      <span style={{ color: '#ffffff' }}>Connect</span>
      <span style={{ color: '#2563EB' }}>Hub</span>
    </div>
    <p style={{ color: '#71717A', fontSize: '14px', margin: 0 }}>
      Connect with the world
    </p>
    <div style={{
      marginTop: '24px',
      width: '28px',
      height: '28px',
      border: '2.5px solid #27272A',
      borderTop: '2.5px solid #2563EB',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <SplashLoader />
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <SplashLoader />
  return !isLoggedIn ? children : <Navigate to="/home" replace />
}

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/post/:id" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/profile/:username/followers" element={<ProtectedRoute><Followers /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App