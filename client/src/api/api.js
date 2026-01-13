import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
}

// Gigs endpoints
export const gigsAPI = {
  getAllGigs: (search = '') => api.get('/gigs', { params: { search } }),
  getGigById: (gigId) => api.get(`/gigs/${gigId}`),
  getMyGigs: () => api.get('/gigs/my/gigs'),
  createGig: (data) => api.post('/gigs', data),
  updateGig: (gigId, data) => api.patch(`/gigs/${gigId}`, data),
  deleteGig: (gigId) => api.delete(`/gigs/${gigId}`),
}

// Bids endpoints
export const bidsAPI = {
  submitBid: (data) => api.post('/bids', data),
  getGigBids: (gigId) => api.get(`/bids/${gigId}`),
  getMyBids: () => api.get('/bids/my/bids'),
  hireBidder: (bidId) => api.patch(`/bids/${bidId}/hire`),
}

export default api
