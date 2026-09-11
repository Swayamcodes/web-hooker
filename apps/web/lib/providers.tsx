'use client'
// This directive marks this as a client component
// Without it, Next.js tries to render it on the server and crashes
// because hooks don't exist server-side

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import type { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // useState here ensures each browser session gets its own QueryClient
  // If we wrote const queryClient = new QueryClient() outside the component,
  // all users would share one client in SSR — their cached data would mix together
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            // Data is considered fresh for 60 seconds
            // TanStack Query won't refetch while data is still fresh
            // After 60s it refetches in the background on next use

            retry: 2,
            // If a query fails, retry twice before showing an error
            // Handles transient network issues automatically

            refetchOnWindowFocus: false,
            // Don't refetch just because the user switched tabs
            // Our Socket.io keeps data live anyway
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools — only shows in development, hidden in production automatically */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}