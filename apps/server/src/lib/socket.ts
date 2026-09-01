import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'

// We create io here but initialize it later from index.ts
// This breaks the circular dependency — hooks.ts imports from here,
// not from index.ts
let io: Server

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  io.on('connection', socket => {
    console.log(`Client connected: ${socket.id}`)

    socket.on('subscribe', (endpointId: string) => {
      socket.join(endpointId)
      console.log(`Socket ${socket.id} joined room ${endpointId}`)
    })

    socket.on('disconnect', reason => {
      console.log(`Client disconnected: ${socket.id} — ${reason}`)
    })
  })

  return io
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized — call initSocket first')
  }
  return io
  // Throws if called before initSocket — clear error message instead of
  // cryptic 'cannot call emit of undefined'
}