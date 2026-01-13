import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

let socket = null

export const initSocket = () => {
  if (socket) return socket

  socket = io(SOCKET_URL, {
    withCredentials: true,
  })

  return socket
}

export const getSocket = () => socket

export const joinUserRoom = (userId) => {
  if (socket) {
    socket.emit('join-user', userId)
  }
}

export const onHired = (callback) => {
  if (socket) {
    socket.on('hired', callback)
  }
}

export const offHired = (callback) => {
  if (socket) {
    socket.off('hired', callback)
  }
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
