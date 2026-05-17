import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import PostDetails from './pages/PostDetails'
import Search from './pages/Search'
import Followers from './pages/Followers'

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

// Public route wrapper (redirect to home if already logged in)
const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useAuth()
  return !isLoggedIn ? children : <Navigate to="/home" replace />
}

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute><Signup /></PublicRoute>
        } />

        {/* Protected routes */}
        <Route path="/home" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute><Explore /></ProtectedRoute>
        } />
        <Route path="/profile/:username" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/profile/edit" element={
          <ProtectedRoute><EditProfile /></ProtectedRoute>
        } />
        <Route path="/post/:id" element={
          <ProtectedRoute><PostDetails /></ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute><Search /></ProtectedRoute>
        } />
        <Route path="/profile/:username/followers" element={
          <ProtectedRoute><Followers /></ProtectedRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App