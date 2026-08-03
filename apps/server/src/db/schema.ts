import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'

// pgTable creates a typed table definition
// First arg = actual table name in PostgreSQL
// Second arg = column definitions

export const endpoints = pgTable('endpoints', {
  // text primary key — we use a short random string like 'x7k2mq'
  // because this becomes part of the webhook URL
  // e.g. localhost:4000/hooks/x7k2mq
  id: text('id').primaryKey(),

  label: text('label').notNull().default('My Endpoint'),

  // timestamp with timezone — always use withTimezone: true
  // stores time in UTC, returns in the correct timezone
  // defaultNow() sets this automatically on insert
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  // tracks total requests received — we increment this on each hit
  requestCount: integer('request_count').default(0).notNull(),

  // we'll add userId here in Phase 8 when we add auth
  // leaving it out for now keeps things simple
})

export const requests = pgTable(
  'requests',
  {
    id: text('id').primaryKey(),

    // foreign key — links each request to its endpoint
    // if the endpoint is deleted, all its requests are deleted too (cascade)
    endpointId: text('endpoint_id')
      .notNull()
      .references(() => endpoints.id, { onDelete: 'cascade' }),

    // HTTP method — GET POST PUT PATCH DELETE etc
    method: text('method').notNull(),

    // jsonb is PostgreSQL's binary JSON — faster to query than plain json
    // headers vary per request so we store as JSON
    headers: jsonb('headers').$type<Record<string, string>>().notNull(),

    // body can be anything — JSON, form data, plain text, null for GET requests
    body: jsonb('body').$type<unknown>(),

    // query string params — ?foo=bar becomes { foo: 'bar' }
    query: jsonb('query').$type<Record<string, string>>().notNull(),

    // sender IP address
    ip: text('ip'),

    // body size in bytes — useful for display
    size: integer('size').default(0).notNull(),

    receivedAt: timestamp('received_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  // second argument to pgTable is for table-level config — indexes go here
  table => [
    // index on endpointId speeds up queries like
    // "get all requests for endpoint X" which we do constantly
    index('requests_endpoint_id_idx').on(table.endpointId),
  ]
)

// Drizzle infers TypeScript types directly from your schema
// $inferSelect = type of a row returned by SELECT
// $inferInsert = type required to INSERT a new row
export type Endpoint = typeof endpoints.$inferSelect
export type NewEndpoint = typeof endpoints.$inferInsert
export type Request = typeof requests.$inferSelect
export type NewRequest = typeof requests.$inferInsert