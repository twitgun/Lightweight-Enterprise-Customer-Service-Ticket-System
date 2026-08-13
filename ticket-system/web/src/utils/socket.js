import { io } from 'socket.io-client'

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io('http://127.0.0.1:3000', {
      auth: { token: localStorage.getItem('ts_token') || '' },
      transports: ['websocket', 'polling']
    })
  }
  return socket
}

export function resetSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
