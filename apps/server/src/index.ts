import dotenv from 'dotenv'
dotenv.config()

import http from 'http'
// Node.js built-in http module — no install needed
// Creates a raw HTTP server that both Express and Socket.io can share

import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import { db } from './db'

const app = express()
const PORT = process.env.PORT ?? 4000

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// express.urlencoded parses form submissions (Content-Type: application/x-www-form-urlencoded)
// extended: true allows nested objects like name[first]=John

// Create the raw http server from the Express app
// Express becomes a request handler for this server
// Any HTTP request → Express handles it
// Any WebSocket upgrade request → Socket.io handles it
// Both share the same port
const httpServer = http.createServer(app)

// Attach Socket.io to the http server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Socket.io needs its own CORS config separate from Express
  // because WebSocket handshakes are a different type of request
})

// Connection handler — fires every time a browser tab connects
io.on('connection', socket => {
  console.log(`Client connected: ${socket.id}`)
  // socket.id is a unique string per connection
  // two tabs open = two different socket.ids

  // When a client connects, tell them which endpoint to listen to
  // The client will send this event with their endpointId
  // We put them in a Socket.io "room" — a named channel
  // io.to(roomName).emit() sends only to clients in that room
  socket.on('subscribe', (endpointId: string) => {
    socket.join(endpointId)
    // socket.join(room) — this client now receives events emitted to this room
    console.log(`Socket ${socket.id} subscribed to endpoint ${endpointId}`)
  })

  socket.on('disconnect', reason => {
    console.log(`Client disconnected: ${socket.id} — ${reason}`)
  })
})

// Health check
app.get('/health', async (_req, res) => {
  try {
    await db.execute('select 1' as unknown as TemplateStringsArray)
    res.json({ status: 'ok', db: 'connected' })
  } catch {
    res.status(500).json({ status: 'error', db: 'disconnected' })
  }
})

// Export io so routes can emit events
// When a webhook arrives, the route needs to call io.to(room).emit(...)
export { io }

// httpServer.listen instead of app.listen
// This starts both HTTP and WebSocket on the same port
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`WebSocket server ready`)
})