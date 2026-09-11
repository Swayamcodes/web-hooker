'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createEndpoint,
  getEndpoint,
  listEndpoints,
  deleteEndpoint,
} from './api'

// Query keys — centralized constants for cache management
// TanStack Query identifies cached data by these keys
// If two components use the same key, they share the same cache
export const queryKeys = {
  endpoints: ['endpoints'] as const,
  endpoint: (id: string) => ['endpoints', id] as const,
  // endpoint('abc') → ['endpoints', 'abc']
  // This means invalidating ['endpoints'] also invalidates ['endpoints', 'abc']
  // because it's a prefix match — parent invalidation cascades to children
}

// ── useListEndpoints ────────────────────────────────────────────
export function useListEndpoints() {
  return useQuery({
    queryKey: queryKeys.endpoints,
    queryFn: listEndpoints,
    // queryFn is the function that fetches the data
    // TanStack Query calls this automatically, handles loading/error states,
    // caches the result, and refetches when stale
  })
}

// ── useEndpoint ─────────────────────────────────────────────────
export function useEndpoint(id: string) {
  return useQuery({
    queryKey: queryKeys.endpoint(id),
    queryFn: () => getEndpoint(id),
    enabled: !!id,
    // enabled: false means the query won't run
    // !!id converts id to boolean — if id is empty string, don't fetch
  })
}

// ── useCreateEndpoint ───────────────────────────────────────────
export function useCreateEndpoint() {
  const queryClient = useQueryClient()
  // useQueryClient gives access to the QueryClient instance
  // We need it to invalidate the cache after creating an endpoint

  return useMutation({
    mutationFn: (label?: string) => createEndpoint(label),
    // useMutation is for operations that change data (POST, PUT, DELETE)
    // useQuery is for reading data (GET)

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endpoints })
      // After creating an endpoint, the list is stale — refetch it
      // invalidateQueries marks the cache as stale and triggers a background refetch
      // The UI updates automatically when the refetch completes
    },
  })
}

// ── useDeleteEndpoint ───────────────────────────────────────────
export function useDeleteEndpoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteEndpoint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endpoints })
    },
  })
}