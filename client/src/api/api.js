import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
}

// Gigs endpoints
export const gigsAPI = {
  getAllGigs: (search = '') => api.get('/api/gigs', { params: { search } }),
  getGigById: (gigId) => api.get(`/api/gigs/${gigId}`),
  getMyGigs: () => api.get('/api/gigs/my/gigs'),
  createGig: (data) => api.post('/api/gigs', data),
  updateGig: (gigId, data) => api.patch(`/api/gigs/${gigId}`, data),
  deleteGig: (gigId) => api.delete(`/api/gigs/${gigId}`),
}

// Bids endpoints
export const bidsAPI = {
  submitBid: (data) => api.post('/api/bids', data),
  getGigBids: (gigId) => api.get(`/api/bids/${gigId}`),
  getMyBids: () => api.get('/api/bids/my/bids'),
  hireBidder: (bidId) => api.patch(`/api/bids/${bidId}/hire`),
}

export default api
