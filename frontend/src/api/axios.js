import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiry globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const registerUser = (data) => API.post('/api/auth/register', data)
export const loginUser = (data) => API.post('/api/auth/login', data)

// Post endpoints
export const getAllPosts = () => API.get('/api/posts')
export const getFeedPosts = () => API.get('/api/posts/feed')
export const getSinglePost = (id) => API.get(`/api/posts/${id}`)
export const createPost = (data) => API.post('/api/posts', data)
export const deletePost = (id) => API.delete(`/api/posts/${id}`)

// Like endpoints
export const likePost = (id) => API.post(`/api/posts/${id}/like`)
export const unlikePost = (id) => API.delete(`/api/posts/${id}/like`)
export const getPostLikes = (id) => API.get(`/api/posts/${id}/likes`)

// Comment endpoints
export const getComments = (id) => API.get(`/api/posts/${id}/comments`)
export const addComment = (id, data) => API.post(`/api/posts/${id}/comments`, data)
export const deleteComment = (id) => API.delete(`/api/posts/comments/${id}`)

// User endpoints
export const getUserProfile = (username) => API.get(`/api/users/${username}`)
export const updateProfile = (data) => API.put('/api/users/profile', data)
export const updateProfilePicture = (url) => API.post(`/api/users/profile/picture?url=${url}`)
export const updateCoverPhoto = (url) => API.post(`/api/users/profile/cover?url=${url}`)
export const getFollowers = (id) => API.get(`/api/users/${id}/followers`)
export const getFollowing = (id) => API.get(`/api/users/${id}/following`)
export const searchUsers = (q) => API.get(`/api/users/search?q=${q}`)

// Follow endpoints
export const followUser = (id) => API.post(`/api/users/${id}/follow`)
export const unfollowUser = (id) => API.delete(`/api/users/${id}/follow`)
export const checkFollow = (id) => API.get(`/api/users/${id}/follow`)

// Search endpoints
export const searchAll = (q, type = 'all') => API.get(`/api/search?q=${q}&type=${type}`)
export const getSuggestedUsers = () => API.get('/api/search/suggested')

// Media endpoints
export const uploadMedia = (formData, folder = 'posts') =>
  API.post(`/api/media/upload?folder=${folder}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
export const deleteMedia = (filename) => API.delete(`/api/media/delete?filename=${filename}`)

export default API