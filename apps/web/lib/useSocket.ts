'use client'

import { useEffect } from 'react'
import { getSocket, disconnectSocket } from './socket'
import { useEndpointStore } from '@/stores/endpointStore'
import type { WebhookRequest } from '@/types'

export function useSocket(endpointId: string | null) {
  const { addLiveRequest, setIsConnected } = useEndpointStore()

  useEffect(() => {
    // Don't connect if there's no endpointId
    if (!endpointId) return

    const socket = getSocket()

    // Connect to the server
    socket.connect()

    // ── Event listeners ─────────────────────────────────────────

    socket.on('connect', () => {
      setIsConnected(true)
      console.log('Socket connected:', socket.id)

      // Join the room for this specific endpoint
      // The server uses this to know which clients to notify
      socket.emit('subscribe', endpointId)
    })

    socket.on('disconnect', reason => {
      setIsConnected(false)
      console.log('Socket disconnected:', reason)
    })

    socket.on('connect_error', error => {
      setIsConnected(false)
      console.error('Socket connection error:', error.message)
    })

    socket.on('new_request', (request: WebhookRequest) => {
      // This fires when someone sends a webhook to this endpoint
      // We push it into Zustand — the UI reacts automatically
      addLiveRequest(request)
    })

    // ── Cleanup ──────────────────────────────────────────────────
    // This runs when:
    // 1. The component unmounts (user navigates away)
    // 2. endpointId changes (user switches endpoint)
    // Without this, old listeners stack up on every re-render — memory leak
    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      socket.off('new_request')
      // socket.off() removes event listeners
      // We remove specific listeners, not all — other parts of the app
      // might have their own listeners on the same socket
      disconnectSocket()
    }
  }, [endpointId,  addLiveRequest, setIsConnected])
  // Re-runs when endpointId changes — disconnects old, connects new

}