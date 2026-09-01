import dotenv from 'dotenv'
dotenv.config()

import http from 'http'
// Node.js built-in http module — no install needed
// Creates a raw HTTP server that both Express and Socket.io can share

import express from 'express'
import cors from 'cors'
import { db } from './db'

import endpointRoutes from './routes/endpoints'
import hookRoutes from './routes/hooks'
import { initSocket } from './lib/socket'

const app = express()
const PORT = process.env.PORT ?? 4000

// ── Middleware ────────────────────────────────────────────────
// Middleware must come BEFORE routes so incoming request bodies
// are parsed before endpoints.ts or hooks.ts handles them.

app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
  credentials: true,
}))

app.use(express.json())

app.use(express.urlencoded({ extended: true }))
// Parses form submissions:
// Content-Type: application/x-www-form-urlencoded
// extended: true allows nested objects like name[first]=John


// ── Health check ──────────────────────────────────────────────

app.get('/health', async (_req, res) => {
  try {
    await db.execute('select 1' as unknown as TemplateStringsArray)

    res.json({
      status: 'ok',
      db: 'connected',
    })
  } catch {
    res.status(500).json({
      status: 'error',
      db: 'disconnected',
    })
  }
})


// ── Routes ────────────────────────────────────────────────────

app.use('/endpoints', endpointRoutes)
// router.post('/')       → POST /endpoints
// router.get('/')        → GET /endpoints
// router.get('/:id')     → GET /endpoints/:id
// router.delete('/:id')  → DELETE /endpoints/:id

app.use('/hooks', hookRoutes)
// router.all('/:endpointId')
// → ANY HTTP METHOD /hooks/:endpointId


// ── HTTP + Socket.io server ───────────────────────────────────

// Create the raw HTTP server from the Express app.
// Express and Socket.io will share this same server and port.
const httpServer = http.createServer(app)

// Initialize Socket.io and attach it to the HTTP server.
// Socket.io configuration now lives in lib/socket.ts.
initSocket(httpServer)


// ── Start server ──────────────────────────────────────────────

// httpServer.listen() replaces app.listen().
// This starts the shared HTTP + Socket.io server.
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log('WebSocket server ready')
})