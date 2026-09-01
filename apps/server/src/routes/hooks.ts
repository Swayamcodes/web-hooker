import { Router } from 'express'
import { db } from '../db'
import { endpoints, requests } from '../db/schema'
import { eq, sql } from 'drizzle-orm'
import { io } from '../index'
// We import io here so we can emit to the room when a request arrives

const router = Router()

// ── ALL /hooks/:endpointId ──────────────────────────────────────
// router.all() matches ANY HTTP method — GET, POST, PUT, DELETE, PATCH etc.
router.all('/:endpointId', async (req, res) => {
  const { endpointId } = req.params

  try {
    // 1. Check endpoint exists
    const endpoint = await db.query.endpoints.findFirst({
      where: eq(endpoints.id, endpointId),
    })

    if (!endpoint) {
      // Return 404 but still a valid response
      // Services sending webhooks need a response or they'll retry forever
      return res.status(404).json({ error: 'Endpoint not found' })
    }

    // 2. Extract request details
    const method = req.method
    // req.method is always uppercase — 'GET', 'POST', 'PUT' etc.

    const headers = req.headers as Record<string, string>
    // req.headers is typed as IncomingHttpHeaders which has optional fields
    // We cast to Record<string, string> for simpler storage
    // In production you'd be more careful here

    const body = req.body ?? null
    // req.body is parsed by express.json() — undefined if no body or wrong Content-Type
    // We store null for bodyless requests (GET, HEAD)

    const query = req.query as Record<string, string>
    // req.query contains parsed query string params
    // ?foo=bar becomes { foo: 'bar' }

    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown'
    // req.ip uses the X-Forwarded-For header if trust proxy is set
    // fallback to socket address, then 'unknown'

    // Calculate body size in bytes
    const bodyString = body ? JSON.stringify(body) : ''
    const size = Buffer.byteLength(bodyString, 'utf8')
    // Buffer.byteLength gives actual byte count — not character count
    // Important because multi-byte characters (emoji, Chinese) are more than 1 byte

    // 3. Save request to database
    const id = require('crypto').randomUUID() as string

    const [savedRequest] = await db
      .insert(requests)
      .values({
        id,
        endpointId,
        method,
        headers,
        body,
        query,
        ip,
        size,
      })
      .returning()

    // 4. Increment request count on the endpoint
    await db
      .update(endpoints)
      .set({
        requestCount: sql`${endpoints.requestCount} + 1`,
        // sql`` is Drizzle's escape hatch for raw SQL fragments
        // We use it here for atomic increment — safe from race conditions
        // Never use sql`` with user input — SQL injection risk
      })
      .where(eq(endpoints.id, endpointId))

    // 5. Broadcast to all clients watching this endpoint
    io.to(endpointId).emit('new_request', savedRequest)
    // io.to(room).emit(event, data)
    // Only clients that called socket.join(endpointId) receive this
    // This is why rooms matter — you don't want endpoint A's requests
    // appearing in endpoint B's dashboard

    // 6. Respond to the sender
    // Always respond quickly — webhook senders have short timeouts
    res.status(200).json({
      success: true,
      message: 'Webhook received',
      requestId: savedRequest.id,
    })

  } catch (error) {
    console.error('Webhook capture failed:', error)
    // Still respond — don't leave the sender hanging
    res.status(500).json({ error: 'Failed to process webhook' })
  }
})

export default router