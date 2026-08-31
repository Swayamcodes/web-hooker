import { Router } from 'express'
import { db } from '../db'
import { endpoints, requests } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

const router = Router()
// Router() creates a mini Express app for grouping related routes
// Instead of app.get('/endpoints/...') everywhere,
// we define routes here and mount them on '/endpoints' in index.ts
// This keeps code organized by feature

// Generates a random short ID for webhook URLs
// e.g. 'x7k2mq9p' — short enough to type, random enough to be unique
function generateId(length = 8): string {
  // crypto is a Node.js built-in — no install needed
  // randomBytes generates cryptographically random bytes
  // toString('hex') converts to a hex string
  // slice(0, length) takes only what we need
  return require('crypto').randomBytes(length).toString('hex').slice(0, length)
}

// ── POST /endpoints ─────────────────────────────────────────────
// Creates a new unique webhook endpoint
router.post('/', async (req, res) => {
  try {
    const id = generateId()
    const label = (req.body?.label as string | undefined) ?? 'My Endpoint'
    // req.body?.label — optional chaining in case body is empty
    // We cast to string | undefined because Express types body as any
    // ?? falls back to default label if none provided

    const [endpoint] = await db
      .insert(endpoints)
      .values({ id, label })
      .returning()
    // .returning() is PostgreSQL-specific — returns the inserted row
    // Without it you'd need a separate SELECT after INSERT
    // The result is an array — we destructure the first element with [endpoint]

    res.status(201).json({
      success: true,
      data: endpoint,
      webhookUrl: `${process.env.SERVER_URL ?? 'http://localhost:4000'}/hooks/${id}`,
      // This is the URL they'll give to services that send webhooks
    })
  } catch (error) {
    console.error('Create endpoint failed:', error)
    res.status(500).json({ success: false, error: 'Failed to create endpoint' })
  }
})

// ── GET /endpoints/:id ──────────────────────────────────────────
// Fetches an endpoint + its most recent requests
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    // req.params contains URL path parameters
    // For route '/:id' and URL '/abc123', req.params.id === 'abc123'

    const endpoint = await db.query.endpoints.findFirst({
      where: eq(endpoints.id, id),
      // eq() generates SQL: WHERE id = 'abc123'
      with: {
        requests: {
          // 'with' performs a JOIN — returns related requests inside the endpoint object
          // This works because we defined the foreign key relationship in schema.ts
          orderBy: [desc(requests.receivedAt)],
          // desc() = ORDER BY received_at DESC — newest first
          limit: 50,
          // Only return last 50 requests — prevents huge payloads
        },
      },
    })

    if (!endpoint) {
      return res.status(404).json({ success: false, error: 'Endpoint not found' })
      // return here is important — stops execution so we don't hit res.json() twice
    }

    res.json({ success: true, data: endpoint })
  } catch (error) {
    console.error('Fetch endpoint failed:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch endpoint' })
  }
})

// ── GET /endpoints ──────────────────────────────────────────────
// Lists all endpoints — we'll use this on the dashboard home
router.get('/', async (_req, res) => {
  try {
    const allEndpoints = await db
      .select()
      .from(endpoints)
      .orderBy(desc(endpoints.createdAt))
    // .select() with no args selects all columns
    // same as SELECT * FROM endpoints ORDER BY created_at DESC

    res.json({ success: true, data: allEndpoints })
  } catch (error) {
    console.error('List endpoints failed:', error)
    res.status(500).json({ success: false, error: 'Failed to list endpoints' })
  }
})

// ── DELETE /endpoints/:id ────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await db.delete(endpoints).where(eq(endpoints.id, id))
    // onDelete: 'cascade' in schema means related requests are deleted automatically
    // No need to manually delete requests first

    res.json({ success: true })
  } catch (error) {
    console.error('Delete endpoint failed:', error)
    res.status(500).json({ success: false, error: 'Failed to delete endpoint' })
  }
})

export default router