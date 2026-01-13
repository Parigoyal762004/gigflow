import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  gigsWithBids: {}, // { gigId: { gig, bids } }
  myBids: [],
  loading: false,
  error: null,
}

const bidsSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    setGigBids: (state, action) => {
      const { gigId, gig, bids } = action.payload
      state.gigsWithBids[gigId] = { gig, bids }
      state.error = null
    },
    setMyBids: (state, action) => {
      state.myBids = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    clearError: (state) => {
      state.error = null
    },
    addBid: (state, action) => {
      state.myBids.unshift(action.payload)
    },
    updateBidStatus: (state, action) => {
      const { bidId, status } = action.payload
      
      // Update in myBids
      const bidIndex = state.myBids.findIndex((b) => b._id === bidId)
      if (bidIndex !== -1) {
        state.myBids[bidIndex].status = status
      }
      
      // Update in gigsWithBids
      Object.values(state.gigsWithBids).forEach((gigData) => {
        const bidIdx = gigData.bids.findIndex((b) => b._id === bidId)
        if (bidIdx !== -1) {
          gigData.bids[bidIdx].status = status
        }
      })
    },
  },
})

export const {
  setGigBids,
  setMyBids,
  setLoading,
  setError,
  clearError,
  addBid,
  updateBidStatus,
} = bidsSlice.actions
export default bidsSlice.reducer
