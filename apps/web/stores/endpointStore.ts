import { create } from 'zustand'
import type { WebhookRequest, Endpoint } from '@/types'

interface EndpointStore {
  // Currently selected endpoint
  currentEndpoint: Endpoint | null
  setCurrentEndpoint: (endpoint: Endpoint | null) => void

  // Live requests — updated by Socket.io events
  liveRequests: WebhookRequest[]
  addLiveRequest: (request: WebhookRequest) => void
  setLiveRequests: (requests: WebhookRequest[]) => void
  clearRequests: () => void

  // Currently selected request for the inspector panel
  selectedRequest: WebhookRequest | null
  setSelectedRequest: (request: WebhookRequest | null) => void

  // Socket connection status — shown in the UI
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
}

export const useEndpointStore = create<EndpointStore>(set => ({
  // create() takes a function that receives 'set'
  // set() merges new state with existing state — like setState in React
  // You don't have to spread the old state manually — Zustand does it

  currentEndpoint: null,
  setCurrentEndpoint: endpoint => set({ currentEndpoint: endpoint }),

  liveRequests: [],

  addLiveRequest: request =>
    set(state => ({
      liveRequests: [request, ...state.liveRequests],
      // Prepend new requests so newest is always at the top
      // state here is the current store state — like the prev callback in useState
    })),

  setLiveRequests: requests => set({ liveRequests: requests }),

  clearRequests: () => set({ liveRequests: [], selectedRequest: null }),

  selectedRequest: null,
  setSelectedRequest: request => set({ selectedRequest: request }),

  isConnected: false,
  setIsConnected: connected => set({ isConnected: connected }),
}))