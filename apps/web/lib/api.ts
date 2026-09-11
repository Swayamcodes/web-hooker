import axios from 'axios'
import type { Endpoint, EndpointWithRequests, ApiResponse } from '@/types'

// axios.create() makes a pre-configured axios instance
// Every request made with this instance automatically has these defaults
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:4000',
  // baseURL means you write api.get('/endpoints') not api.get('http://localhost:4000/endpoints')
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  // If the server doesn't respond in 10 seconds, throw an error
  // Without this, requests can hang forever
  withCredentials: true,
  // Send cookies with every request — needed for auth later
})

// ── Endpoint API calls ──────────────────────────────────────────

export async function createEndpoint(label?: string): Promise<{
  endpoint: Endpoint
  webhookUrl: string
}> {
  const response = await api.post<ApiResponse<Endpoint>>('/endpoints', { label })
  const data = response.data

  if (!data.success) {
    throw new Error(data.error)
    // TanStack Query catches this throw and puts the query in error state
    // Never return error objects — always throw so the library knows it failed
  }

  return {
    endpoint: data.data,
    webhookUrl: data.webhookUrl ?? '',
  }
}

export async function getEndpoint(id: string): Promise<EndpointWithRequests> {
  const response = await api.get<ApiResponse<EndpointWithRequests>>(`/endpoints/${id}`)
  const data = response.data

  if (!data.success) throw new Error(data.error)
  return data.data
}

export async function listEndpoints(): Promise<Endpoint[]> {
  const response = await api.get<ApiResponse<Endpoint[]>>('/endpoints')
  const data = response.data

  if (!data.success) throw new Error(data.error)
  return data.data
}

export async function deleteEndpoint(id: string): Promise<void> {
  const response = await api.delete<ApiResponse<null>>(`/endpoints/${id}`)
  const data = response.data

  if (!data.success) throw new Error(data.error)
}