import dotenv from 'dotenv'
dotenv.config()
// dotenv.config() must run before anything else reads process.env

import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT ?? 4000

app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
// express.json() parses incoming JSON request bodies into req.body
// without this req.body is undefined

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})
// _req — the underscore prefix means "I know this parameter exists but I'm not using it"
// TypeScript's noUnusedParameters would error without it

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})