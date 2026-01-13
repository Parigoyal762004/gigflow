import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { removeNotification } from '../store/slices/notificationSlice'

export default function NotificationCenter() {
  const { notifications } = useSelector((state) => state.notification)
  const dispatch = useDispatch()

  return (
    <div className="fixed bottom-lg right-lg space-y-md z-50 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="pointer-events-auto bg-white rounded-lg shadow-lg border-l-4 border-primary-500 p-lg max-w-sm animate-slide-up"
        >
          <div className="flex items-start justify-between gap-md">
            <div>
              <h3 className="font-semibold text-neutral-900">
                {notification.title || 'Update'}
              </h3>
              <p className="text-sm text-neutral-600 mt-xs">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => dispatch(removeNotification(notification.id))}
              className="text-neutral-400 hover:text-neutral-600 transition"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
