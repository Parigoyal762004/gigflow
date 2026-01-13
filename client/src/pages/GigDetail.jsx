import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { gigsAPI, bidsAPI } from '../api/api'
import { setSelectedGig, setLoading, setError } from '../store/slices/gigsSlice'
import { addBid } from '../store/slices/bidsSlice'
import { addNotification } from '../store/slices/notificationSlice'

export default function GigDetail() {
  const { gigId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { selectedGig, loading } = useSelector((state) => state.gigs)
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const [bidData, setBidData] = useState({
    message: '',
    price: '',
  })
  const [bidSubmitting, setBidSubmitting] = useState(false)
  const [bidError, setBidError] = useState('')

  // Fetch gig details
  useEffect(() => {
    const fetchGig = async () => {
      dispatch(setLoading(true))
      try {
        const response = await gigsAPI.getGigById(gigId)
        dispatch(setSelectedGig(response.data.gig))
      } catch (error) {
        dispatch(setError(error.response?.data?.error || 'Failed to load gig'))
      } finally {
        dispatch(setLoading(false))
      }
    }

    fetchGig()
  }, [gigId, dispatch])

  const handleBidChange = (e) => {
    setBidData({
      ...bidData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmitBid = async (e) => {
    e.preventDefault()
    setBidError('')

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!bidData.message || !bidData.price) {
      setBidError('Please fill in all fields')
      return
    }

    setBidSubmitting(true)
    try {
      const response = await bidsAPI.submitBid({
        gigId,
        message: bidData.message,
        price: parseFloat(bidData.price),
      })

      dispatch(addBid(response.data.bid))
      setBidData({ message: '', price: '' })
      dispatch(
        addNotification({
          title: 'Bid Submitted',
          message: `Your bid of $${bidData.price} has been submitted`,
        })
      )
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to submit bid'
      setBidError(message)
    } finally {
      setBidSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Loading gig details...</p>
      </div>
    )
  }

  if (!selectedGig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Gig not found</p>
      </div>
    )
  }

  const isOwner = user && user.id === selectedGig.ownerId._id

  return (
    <div className="max-w-4xl mx-auto px-lg py-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2xl">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-neutral-200 p-2xl">
            <div className="mb-2xl">
              <h1 className="text-3xl font-bold text-neutral-900 mb-lg">
                {selectedGig.title}
              </h1>

              <div className="flex items-center gap-md mb-lg">
                <span className={`px-md py-sm rounded-md text-sm font-medium ${
                  selectedGig.status === 'open'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {selectedGig.status === 'open' ? '🟢 Open' : '🔒 Assigned'}
                </span>
                <span className="text-neutral-500 text-sm">
                  Posted {new Date(selectedGig.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-md pb-lg border-b border-neutral-200">
                <div>
                  <p className="text-sm text-neutral-500">Posted by</p>
                  <p className="font-semibold text-neutral-900">
                    {selectedGig.ownerId?.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-2xl">
              <h2 className="font-semibold text-lg text-neutral-900 mb-lg">
                About this gig
              </h2>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {selectedGig.description}
              </p>
            </div>

            {selectedGig.bidCount !== undefined && (
              <div className="p-lg bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">
                  {selectedGig.bidCount} bid{selectedGig.bidCount !== 1 ? 's' : ''} received
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white rounded-lg border border-neutral-200 p-2xl sticky top-lg">
            <div className="mb-2xl">
              <p className="text-sm text-neutral-500 uppercase tracking-wide">Budget</p>
              <p className="text-4xl font-bold text-primary-600">
                ${selectedGig.budget}
              </p>
            </div>

            {isOwner ? (
              <div className="p-lg bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  You posted this gig. Check the bids in your dashboard to hire someone.
                </p>
              </div>
            ) : selectedGig.status === 'assigned' ? (
              <div className="p-lg bg-neutral-100 border border-neutral-300 rounded-lg">
                <p className="text-sm text-neutral-700">
                  This gig has already been assigned. Check other gigs to submit bids.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitBid} className="space-y-lg">
                {bidError && (
                  <div className="p-lg bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {bidError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-md">
                    Your Bid Message
                  </label>
                  <textarea
                    name="message"
                    value={bidData.message}
                    onChange={handleBidChange}
                    placeholder="Tell the client why you're the right fit..."
                    className="w-full px-lg py-md border border-neutral-300 rounded-md bg-white text-sm"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-md">
                    Proposed Price
                  </label>
                  <div className="flex items-center gap-md">
                    <span className="text-neutral-600">$</span>
                    <input
                      type="number"
                      name="price"
                      value={bidData.price}
                      onChange={handleBidChange}
                      placeholder="0.00"
                      className="flex-1 px-lg py-md border border-neutral-300 rounded-md bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bidSubmitting || !isAuthenticated}
                  className="w-full px-lg py-md bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-md font-semibold transition"
                >
                  {!isAuthenticated ? 'Sign in to Bid' : bidSubmitting ? 'Submitting...' : 'Submit Bid'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
