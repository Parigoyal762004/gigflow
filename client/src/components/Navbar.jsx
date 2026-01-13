import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { authAPI } from '../api/api'

export default function Navbar() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      dispatch(logout())
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-lg py-md flex items-center justify-between">
        <Link to="/" className="flex items-center gap-md">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">GF</span>
          </div>
          <span className="font-semibold text-lg text-neutral-900">GigFlow</span>
        </Link>

        <div className="flex items-center gap-lg">
          {isAuthenticated ? (
            <>
              <Link
                to="/browse"
                className="text-neutral-600 hover:text-primary-600 font-medium transition"
              >
                Browse Gigs
              </Link>
              <Link
                to="/dashboard"
                className="text-neutral-600 hover:text-primary-600 font-medium transition"
              >
                Dashboard
              </Link>
              <div className="border-r border-neutral-200 h-6"></div>
              <div className="text-sm text-neutral-600">
                {user?.name}
              </div>
              <button
                onClick={handleLogout}
                className="px-md py-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-md font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-neutral-600 hover:text-primary-600 font-medium transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-md py-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
