import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setAllGigs, setLoading, setError } from '../store/slices/gigsSlice'
import { gigsAPI } from '../api/api'
import GigCard from '../components/GigCard'

export default function Browse() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const dispatch = useDispatch()
  const { allGigs, loading } = useSelector((state) => state.gigs)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Fetch gigs
  useEffect(() => {
    const fetchGigs = async () => {
      dispatch(setLoading(true))
      try {
        const response = await gigsAPI.getAllGigs(debouncedSearch)
        dispatch(setAllGigs(response.data.gigs))
      } catch (error) {
        dispatch(setError(error.response?.data?.error || 'Failed to load gigs'))
      } finally {
        dispatch(setLoading(false))
      }
    }

    fetchGigs()
  }, [debouncedSearch, dispatch])

  return (
    <div className="max-w-6xl mx-auto px-lg py-2xl">
      <div className="mb-2xl">
        <h1 className="text-3xl font-bold text-neutral-900 mb-lg">Browse Gigs</h1>
        
        <input
          type="text"
          placeholder="Search gigs by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-lg py-md border border-neutral-300 rounded-md bg-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-2xl">
          <p className="text-neutral-600">Loading gigs...</p>
        </div>
      ) : allGigs.length === 0 ? (
        <div className="text-center py-2xl">
          <p className="text-neutral-600">
            {search ? 'No gigs found matching your search.' : 'No gigs available yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {allGigs.map((gig) => (
            <GigCard key={gig._id} gig={gig} />
          ))}
        </div>
      )}
    </div>
  )
}
