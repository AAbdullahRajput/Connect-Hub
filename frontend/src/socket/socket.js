import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL

let socket = null

// Connect to socket server
export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
    })
  }
  return socket
}

// Get existing socket instance
export const getSocket = () => socket

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Join a post room (for real-time comments & likes)
export const joinPost = (postId) => {
  if (socket) socket.emit('join_post', { post_id: postId })
}

// Leave a post room
export const leavePost = (postId) => {
  if (socket) socket.emit('leave_post', { post_id: postId })
}

// Listen for live like updates
export const onPostLiked = (callback) => {
  if (socket) socket.on('post:liked', callback)
}

// Listen for live comment updates
export const onPostCommented = (callback) => {
  if (socket) socket.on('post:commented', callback)
}

// Listen for live new posts in feed
export const onPostCreated = (callback) => {
  if (socket) socket.on('post:created', callback)
}

// Listen for live follow updates
export const onUserFollowed = (callback) => {
  if (socket) socket.on('user:followed', callback)
}

// Remove all listeners (call on component unmount)
export const removeSocketListeners = () => {
  if (socket) {
    socket.off('post:liked')
    socket.off('post:commented')
    socket.off('post:created')
    socket.off('user:followed')
  }
}

export default socket