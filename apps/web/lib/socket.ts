import { io, Socket } from 'socket.io-client'

// Module-level variable — one socket instance shared across the app
// We don't create a new socket on every component render
let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000', {
      // autoConnect: false means the socket doesn't connect immediately on creation
      // We connect manually when we're ready
      autoConnect: false,
      // transports tells Socket.io to use WebSocket directly
      // instead of starting with HTTP long-polling and upgrading
      // More efficient, faster connection
      transports: ['websocket'],
    })
  }
  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
    // Set to null so getSocket() creates a fresh instance next time
  }
}