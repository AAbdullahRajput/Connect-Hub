import { createContext, useContext, useState, useEffect } from 'react'
import { connectSocket, disconnectSocket } from '../socket/socket'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setToken(savedToken)
      connectSocket()
    }

    setLoading(false)
  }, [])

  // Login — save user & token, connect socket
  const login = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userToken)
    connectSocket()
  }

  // Logout — clear everything, disconnect socket
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    disconnectSocket()
    window.location.href = '/login'
  }

  // Update user data in context & localStorage
  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      isLoggedIn: !!user
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

export default AuthContext