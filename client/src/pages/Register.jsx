import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser, setError } from '../store/slices/authSlice'
import { authAPI } from '../api/api'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setLocalError] = useState('')

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!formData.name || !formData.email || !formData.password) {
      setLocalError('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.register(formData)
      dispatch(setUser(response.data.user))
      navigate('/dashboard')
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed'
      setLocalError(message)
      dispatch(setError(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-neutral-50 flex items-center justify-center px-lg">
      <div className="w-full max-w-md bg-white rounded-lg border border-neutral-200 p-2xl">
        <h1 className="text-3xl font-bold text-neutral-900 mb-md">Create Account</h1>
        <p className="text-neutral-600 mb-2xl">
          Join GigFlow and start posting or bidding on gigs.
        </p>

        {error && (
          <div className="mb-lg p-lg bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-lg">
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-md">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-lg py-md border border-neutral-300 rounded-md bg-white"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-md">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-lg py-md border border-neutral-300 rounded-md bg-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-md">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-lg py-md border border-neutral-300 rounded-md bg-white"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-md">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-lg py-md border border-neutral-300 rounded-md bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-lg py-md bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-md font-semibold transition"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-neutral-600 mt-2xl">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
