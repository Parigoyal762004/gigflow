import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import gigsReducer from './slices/gigsSlice'
import bidsReducer from './slices/bidsSlice'
import notificationReducer from './slices/notificationSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    gigs: gigsReducer,
    bids: bidsReducer,
    notification: notificationReducer,
  },
})
