import React from 'react'
import { Link } from 'react-router-dom'

export default function GigCard({ gig, bidCount = 0 }) {
  return (
    <Link
      to={`/gig/${gig._id}`}
      className="bg-white rounded-lg p-lg border border-neutral-200 hover:shadow-md transition"
    >
      <h3 className="font-semibold text-lg text-neutral-900 mb-md line-clamp-2">
        {gig.title}
      </h3>
      
      <p className="text-neutral-600 text-sm mb-lg line-clamp-3">
        {gig.description}
      </p>

      <div className="flex items-center justify-between pt-lg border-t border-neutral-100">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wide">Budget</p>
          <p className="text-lg font-semibold text-primary-600">
            ${gig.budget}
          </p>
        </div>
        
        {bidCount !== undefined && (
          <div className="text-right">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Bids</p>
            <p className="text-lg font-semibold text-neutral-900">
              {bidCount}
            </p>
          </div>
        )}
      </div>

      <div className="mt-lg pt-lg border-t border-neutral-100 flex items-center gap-md">
        <div className="flex-1">
          <p className="text-xs text-neutral-500">
            {gig.status === 'open' ? '🟢 Open' : '🔒 Assigned'}
          </p>
        </div>
        <div className="text-xs text-neutral-400">
          {new Date(gig.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  )
}
