import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { db } from './db'
// Just importing it is enough to verify the connection config is correct
// We'll use db in routes starting Phase 3

const app = express()
const PORT = process.env.PORT ?? 4000

app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())

app.get('/health', async (_req, res) => {
  try {
    // Quick query to verify DB connection is alive
    await db.execute('select 1')
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() })
  } catch {
    res.status(500).json({ status: 'error', db: 'disconnected' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})