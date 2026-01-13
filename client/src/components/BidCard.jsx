import React, { useState } from 'react'
import { bidsAPI } from '../api/api'
import { useDispatch, useSelector } from 'react-redux'
import { addNotification } from '../store/slices/notificationSlice'

export default function BidCard({ bid, isOwner = false, gigTitle = '' }) {
  const [hiring, setHiring] = useState(false)
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const handleHire = async () => {
    if (!isOwner) return

    setHiring(true)
    try {
      await bidsAPI.hireBidder(bid._id)
      dispatch(
        addNotification({
          title: 'Freelancer Hired!',
          message: `${bid.freelancerId.name} has been hired for ${gigTitle}`,
        })
      )
    } catch (error) {
      dispatch(
        addNotification({
          title: 'Hiring Failed',
          message: error.response?.data?.error || 'Could not hire this freelancer',
        })
      )
    } finally {
      setHiring(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'hired':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      hired: '✓ Hired',
      rejected: '✗ Rejected',
    }
    return labels[status] || status
  }

  return (
    <div className="bg-white rounded-lg p-lg border border-neutral-200">
      <div className="flex items-start justify-between mb-lg">
        <div>
          <h4 className="font-semibold text-neutral-900">
            {bid.freelancerId?.name || 'Anonymous'}
          </h4>
          <p className="text-sm text-neutral-500 mt-xs">
            {bid.freelancerId?.email}
          </p>
        </div>
        <span
          className={`px-md py-sm rounded-md text-sm font-medium border ${getStatusColor(
            bid.status
          )}`}
        >
          {getStatusLabel(bid.status)}
        </span>
      </div>

      <p className="text-neutral-700 mb-lg">{bid.message}</p>

      <div className="flex items-center justify-between pt-lg border-t border-neutral-100">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Proposed Price</p>
          <p className="text-xl font-semibold text-primary-600">
            ${bid.price}
          </p>
        </div>

        {isOwner && bid.status === 'pending' && (
          <button
            onClick={handleHire}
            disabled={hiring}
            className="px-lg py-md bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-md font-medium transition"
          >
            {hiring ? 'Hiring...' : 'Hire'}
          </button>
        )}
      </div>

      <p className="text-xs text-neutral-400 mt-lg">
        Submitted {new Date(bid.createdAt).toLocaleDateString()}
      </p>
    </div>
  )
}
