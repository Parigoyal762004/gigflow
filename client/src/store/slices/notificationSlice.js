import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        ...action.payload,
      }
      state.notifications.push(notification)
      
      // Auto-remove after 5 seconds if not explicitly persistent
      if (!action.payload.persistent) {
        setTimeout(() => {
          state.notifications = state.notifications.filter(
            (n) => n.id !== notification.id
          )
        }, 5000)
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const { addNotification, removeNotification, clearNotifications } =
  notificationSlice.actions
export default notificationSlice.reducer
