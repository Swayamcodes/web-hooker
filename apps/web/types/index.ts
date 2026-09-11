// These mirror the Drizzle $inferSelect types from the backend
// In a more advanced setup you'd share these directly from a shared package
// For now we define them here and keep them in sync manually

export interface Endpoint {
  id: string
  label: string
  createdAt: string        // comes as ISO string over JSON
  requestCount: number
}

export interface WebhookRequest {
  id: string
  endpointId: string
  method: HttpMethod
  headers: Record<string, string>
  body: unknown            // could be anything — JSON, string, null
  query: Record<string, string>
  ip: string | null
  size: number
  receivedAt: string
}

// Union type — only these HTTP methods are valid
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'

// The shape of every API response from your Express server
// success: true → data exists
// success: false → error exists
export type ApiResponse<T> =
  | { success: true; data: T; webhookUrl?: string }
  | { success: false; error: string }

// Endpoint with its requests included — from GET /endpoints/:id
export interface EndpointWithRequests extends Endpoint {
  requests: WebhookRequest[]
}