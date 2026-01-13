import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function Home() {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-neutral-50">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-lg py-3xl text-center">
        <div className="mb-2xl">
          <h1 className="text-5xl font-bold text-neutral-900 mb-lg leading-tight">
            Find Your Next Gig
          </h1>
          <p className="text-xl text-neutral-600">
            A clean, thoughtful marketplace where clients post jobs and freelancers bring them to life.
          </p>
        </div>

        <div className="flex items-center gap-lg justify-center">
          {isAuthenticated ? (
            <>
              <Link
                to="/browse"
                className="px-2xl py-lg bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition"
              >
                Browse Gigs
              </Link>
              <Link
                to="/dashboard"
                className="px-2xl py-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-900 rounded-lg font-semibold transition"
              >
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="px-2xl py-lg bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-2xl py-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-900 rounded-lg font-semibold transition"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-lg py-3xl">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2xl text-center">
          Built for clarity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2xl">
          <div className="bg-white rounded-lg p-2xl border border-neutral-200">
            <div className="text-3xl mb-lg">📝</div>
            <h3 className="font-semibold text-lg text-neutral-900 mb-md">
              Post a Job
            </h3>
            <p className="text-neutral-600">
              Share your project with just a title, description, and budget. It's that simple.
            </p>
          </div>

          <div className="bg-white rounded-lg p-2xl border border-neutral-200">
            <div className="text-3xl mb-lg">💬</div>
            <h3 className="font-semibold text-lg text-neutral-900 mb-md">
              Get Bids
            </h3>
            <p className="text-neutral-600">
              Freelancers submit bids with their message and proposed price. Review at your own pace.
            </p>
          </div>

          <div className="bg-white rounded-lg p-2xl border border-neutral-200">
            <div className="text-3xl mb-lg">✨</div>
            <h3 className="font-semibold text-lg text-neutral-900 mb-md">
              Hire & Go
            </h3>
            <p className="text-neutral-600">
              One click to hire. All other bids are automatically rejected. Clean and atomic.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="max-w-5xl mx-auto px-lg py-3xl bg-white rounded-lg border border-neutral-200 mt-2xl">
        <h3 className="text-2xl font-bold text-neutral-900 mb-lg text-center">
          Powered by
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-lg text-center text-neutral-600 text-sm">
          <div>React 18</div>
          <div>Express.js</div>
          <div>MongoDB</div>
          <div>Socket.io</div>
          <div>Tailwind CSS</div>
          <div>Redux Toolkit</div>
          <div>JWT Auth</div>
          <div>Vite</div>
        </div>
      </div>
    </div>
  )
}
