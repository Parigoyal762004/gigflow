import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  allGigs: [],
  myGigs: [],
  selectedGig: null,
  loading: false,
  error: null,
}

const gigsSlice = createSlice({
  name: 'gigs',
  initialState,
  reducers: {
    setAllGigs: (state, action) => {
      state.allGigs = action.payload
      state.error = null
    },
    setMyGigs: (state, action) => {
      state.myGigs = action.payload
    },
    setSelectedGig: (state, action) => {
      state.selectedGig = action.payload
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
    addGig: (state, action) => {
      state.myGigs.unshift(action.payload)
    },
    updateGig: (state, action) => {
      const index = state.myGigs.findIndex((g) => g._id === action.payload._id)
      if (index !== -1) {
        state.myGigs[index] = action.payload
      }
    },
    removeGig: (state, action) => {
      state.myGigs = state.myGigs.filter((g) => g._id !== action.payload)
    },
  },
})

export const {
  setAllGigs,
  setMyGigs,
  setSelectedGig,
  setLoading,
  setError,
  clearError,
  addGig,
  updateGig,
  removeGig,
} = gigsSlice.actions
export default gigsSlice.reducer
