import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from './store/slices/authSlice'
import { authAPI } from './api/api'
import { initSocket, joinUserRoom, onHired, disconnectSocket } from './api/socket'
import { addNotification } from './store/slices/notificationSlice'

// Components
import Navbar from './components/Navbar'
import NotificationCenter from './components/NotificationCenter'
import ProtectedRoute from './pages/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Browse from './pages/Browse'
import GigDetail from './pages/GigDetail'
import Dashboard from './pages/Dashboard'
import BidManagement from './pages/BidManagement'

export default function App() {
  const dispatch = useDispatch()

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getMe()
        dispatch(setUser(response.data.user))

        // Initialize socket connection
        const socket = initSocket()
        joinUserRoom(response.data.user.id)

        // Listen for hiring notifications
        onHired((data) => {
          dispatch(
            addNotification({
              title: 'Congratulations!',
              message: data.message,
            })
          )
        })
      } catch (error) {
        // User not authenticated
        disconnectSocket()
      }
    }

    checkAuth()

    return () => {
      disconnectSocket()
    }
  }, [dispatch])

  return (
    <BrowserRouter>
      <Navbar />
      <NotificationCenter />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/gig/:gigId" element={<GigDetail />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gig/:gigId/bids"
          element={
            <ProtectedRoute>
              <BidManagement />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
