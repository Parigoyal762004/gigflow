import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { bidsAPI } from '../api/api'
import { setGigBids, setLoading, setError } from '../store/slices/bidsSlice'
import BidCard from '../components/BidCard'

export default function BidManagement() {
  const { gigId } = useParams()
  const dispatch = useDispatch()

  const { gigsWithBids, loading } = useSelector((state) => state.bids)
  const { user } = useSelector((state) => state.auth)

  const gigData = gigsWithBids[gigId]

  useEffect(() => {
    const fetchBids = async () => {
      dispatch(setLoading(true))
      try {
        const response = await bidsAPI.getGigBids(gigId)
        dispatch(
          setGigBids({
            gigId,
            gig: response.data.gig,
            bids: response.data.bids,
          })
        )
      } catch (error) {
        dispatch(setError(error.response?.data?.error || 'Failed to load bids'))
      } finally {
        dispatch(setLoading(false))
      }
    }

    fetchBids()
  }, [gigId, dispatch])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Loading bids...</p>
      </div>
    )
  }

  if (!gigData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Bids not found</p>
      </div>
    )
  }

  const { gig, bids } = gigData

  return (
    <div className="max-w-4xl mx-auto px-lg py-2xl">
      <div className="mb-2xl">
        <h1 className="text-3xl font-bold text-neutral-900 mb-lg">
          Bids for: {gig.title}
        </h1>

        <div className="flex items-center gap-lg">
          <div>
            <p className="text-sm text-neutral-500">Budget</p>
            <p className="text-2xl font-semibold text-primary-600">${gig.budget}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Status</p>
            <p className="text-lg font-semibold text-neutral-900">
              {gig.status === 'open' ? '🟢 Open' : '🔒 Assigned'}
            </p>
          </div>
        </div>
      </div>

      {bids.length === 0 ? (
        <div className="text-center py-2xl p-lg bg-neutral-50 rounded-lg">
          <p className="text-neutral-600">
            No bids yet. Share your gig and wait for freelancers to apply.
          </p>
        </div>
      ) : (
        <div className="space-y-lg">
          {bids.map((bid) => (
            <BidCard
              key={bid._id}
              bid={bid}
              isOwner={user?.id === gig._id}
              gigTitle={gig.title}
            />
          ))}
        </div>
      )}
    </div>
  )
}
