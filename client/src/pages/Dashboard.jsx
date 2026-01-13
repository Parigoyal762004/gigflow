import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { gigsAPI, bidsAPI } from '../api/api'
import { setMyGigs, addGig, setLoading, setError } from '../store/slices/gigsSlice'
import { setMyBids } from '../store/slices/bidsSlice'
import GigCard from '../components/GigCard'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { myGigs, loading } = useSelector((state) => state.gigs)
  const { myBids } = useSelector((state) => state.bids)

  const [tab, setTab] = useState('posted') // 'posted' or 'bids'
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Fetch user's gigs and bids
  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true))
      try {
        const [gigsRes, bidsRes] = await Promise.all([
          gigsAPI.getMyGigs(),
          bidsAPI.getMyBids(),
        ])

        dispatch(setMyGigs(gigsRes.data.gigs))
        dispatch(setMyBids(bidsRes.data.bids))
      } catch (error) {
        dispatch(setError(error.response?.data?.error || 'Failed to load data'))
      } finally {
        dispatch(setLoading(false))
      }
    }

    fetchData()
  }, [dispatch])

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCreateGig = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.title || !formData.description || !formData.budget) {
      setFormError('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await gigsAPI.createGig({
        ...formData,
        budget: parseFloat(formData.budget),
      })

      dispatch(addGig(response.data.gig))
      setFormData({ title: '', description: '', budget: '' })
      setShowForm(false)
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to create gig')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-lg py-2xl">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2xl">Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-lg mb-2xl border-b border-neutral-200">
        <button
          onClick={() => setTab('posted')}
          className={`px-lg py-md font-medium transition ${
            tab === 'posted'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Posted Gigs
        </button>
        <button
          onClick={() => setTab('bids')}
          className={`px-lg py-md font-medium transition ${
            tab === 'bids'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          My Bids
        </button>
      </div>

      {/* Posted Gigs Tab */}
      {tab === 'posted' && (
        <div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-2xl px-lg py-md bg-primary-600 hover:bg-primary-700 text-white rounded-md font-semibold transition"
          >
            {showForm ? 'Cancel' : '+ Post New Gig'}
          </button>

          {showForm && (
            <div className="bg-white rounded-lg border border-neutral-200 p-2xl mb-2xl">
              <h2 className="text-lg font-semibold text-neutral-900 mb-lg">
                Post a New Gig
              </h2>

              {formError && (
                <div className="mb-lg p-lg bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateGig} className="space-y-lg">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-md">
                    Gig Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="e.g., Build a React Dashboard"
                    className="w-full px-lg py-md border border-neutral-300 rounded-md bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-md">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Describe the project in detail..."
                    className="w-full px-lg py-md border border-neutral-300 rounded-md bg-white text-sm"
                    rows="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-md">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleFormChange}
                    placeholder="500"
                    className="w-full px-lg py-md border border-neutral-300 rounded-md bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-lg py-md bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-md font-semibold transition"
                >
                  {submitting ? 'Creating...' : 'Create Gig'}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <p className="text-neutral-600">Loading gigs...</p>
          ) : myGigs.length === 0 ? (
            <div className="text-center py-2xl p-lg bg-neutral-50 rounded-lg">
              <p className="text-neutral-600">
                You haven't posted any gigs yet. Start by creating one above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {myGigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} bidCount={gig.bidCount} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Bids Tab */}
      {tab === 'bids' && (
        <div>
          {loading ? (
            <p className="text-neutral-600">Loading bids...</p>
          ) : myBids.length === 0 ? (
            <div className="text-center py-2xl p-lg bg-neutral-50 rounded-lg">
              <p className="text-neutral-600">
                You haven't submitted any bids yet. Browse gigs to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-lg">
              {myBids.map((bid) => (
                <div key={bid._id} className="bg-white rounded-lg border border-neutral-200 p-lg">
                  <div className="flex items-start justify-between mb-lg">
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {bid.gigId?.title || 'Unknown Gig'}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-xs">
                        Budget: ${bid.gigId?.budget}
                      </p>
                    </div>
                    <span
                      className={`px-md py-sm rounded-md text-sm font-medium ${
                        bid.status === 'hired'
                          ? 'bg-green-50 text-green-700'
                          : bid.status === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      {bid.status === 'hired' ? '✓ Hired' : bid.status === 'rejected' ? '✗ Rejected' : 'Pending'}
                    </span>
                  </div>

                  <p className="text-neutral-700 mb-lg">{bid.message}</p>

                  <div className="flex items-center justify-between pt-lg border-t border-neutral-100">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">Your Bid</p>
                      <p className="text-xl font-semibold text-primary-600">
                        ${bid.price}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {new Date(bid.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
