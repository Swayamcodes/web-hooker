import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}
// Fail fast — if there's no DB URL crash immediately with a clear message
// Much better than a cryptic error later when a query fails

// Pool manages multiple database connections
// Instead of opening a new connection per query (slow),
// a pool keeps connections alive and reuses them
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                  // max 10 simultaneous connections
  idleTimeoutMillis: 30000, // close idle connections after 30s
  connectionTimeoutMillis: 2000, // fail after 2s if can't connect
})

// drizzle wraps the pool and gives the typed query builder
// passing schema enables relational queries (with: { requests: true })
export const db = drizzle(pool, { schema })

export { pool }