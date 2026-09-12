'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateEndpoint } from '@/lib/queries'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'

export default function Home() {
  const router = useRouter()
  // useRouter from next/navigation — for programmatic navigation
  // different from react-router — Next.js has its own router

  const [label, setLabel] = useState('')
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const createEndpoint = useCreateEndpoint()
  // createEndpoint.mutate() — triggers the mutation
  // createEndpoint.isPending — true while the request is in flight
  // createEndpoint.isError — true if it failed

  async function handleCreate(): Promise<void> {
    try {
      const result = await createEndpoint.mutateAsync(label || undefined)
      // mutateAsync returns a Promise — use when you need the result immediately
      // mutate() is fire-and-forget — use when you don't need the result
      // label || undefined — send undefined if label is empty so the backend uses the default

      setWebhookUrl(result.webhookUrl)
      setCreatedId(result.endpoint.id)
    } catch {
      // createEndpoint.isError handles this in the UI
      // no need to set local error state
    }
  }

  return (
    <main className='min-h-screen flex flex-col items-center justify-center p-6'>
      {/* Hero section */}
      <div className='text-center mb-12'>
        <div className='text-5xl mb-4'>🪝</div>
        <h1 className='text-4xl font-bold text-white mb-3'>
          Web Hooker
        </h1>
        <p className='text-slate-400 text-lg max-w-md'>
          Instantly inspect and debug webhook requests.
          Create an endpoint, share the URL, watch requests arrive live.
        </p>
      </div>

      {/* Create endpoint card */}
      <div className='w-full max-w-md bg-surface-raised border border-border rounded-2xl p-6'>
        <h2 className='text-white font-semibold mb-4'>
          Create a new endpoint
        </h2>

        <div className='flex gap-2 mb-4'>
          <input
            type='text'
            placeholder='Label (optional)'
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            // Submit on Enter — small UX detail that matters
            className='
              flex-1 bg-surface border border-border rounded-lg
              px-3 py-2 text-sm text-white placeholder:text-slate-500
              focus:outline-none focus:border-accent
              transition-colors
            '
          />
          <Button
            onClick={handleCreate}
            isLoading={createEndpoint.isPending}
          >
            Create
          </Button>
        </div>

        {createEndpoint.isError && (
          <p className='text-danger text-sm mb-4'>
            Failed to create endpoint. Is the server running?
          </p>
        )}

        {/* Webhook URL — shown after creation */}
        {webhookUrl && createdId && (
          <div className='space-y-3'>
            <div className='bg-surface border border-border rounded-lg p-3'>
              <div className='flex items-center justify-between mb-1'>
                <span className='text-xs text-slate-500 font-medium'>
                  Your webhook URL
                </span>
                <CopyButton text={webhookUrl} />
              </div>
              <p className='text-sm font-mono text-accent break-all'>
                {webhookUrl}
              </p>
              {/* break-all prevents long URLs from overflowing the card */}
            </div>

            <p className='text-xs text-slate-500 text-center'>
              Send any HTTP request to this URL to inspect it
            </p>

            <Button
              variant='ghost'
              className='w-full justify-center'
              onClick={() => router.push(`/dashboard/${createdId}`)}
            >
              Open dashboard →
            </Button>
          </div>
        )}
      </div>

      {/* How it works — simple 3 step explainer */}
      <div className='mt-12 grid grid-cols-3 gap-6 max-w-lg text-center'>
        {[
          { step: '1', title: 'Create', desc: 'Generate a unique webhook URL' },
          { step: '2', title: 'Share', desc: 'Send it to any service or API' },
          { step: '3', title: 'Inspect', desc: 'Watch requests arrive in real time' },
        ].map(item => (
          <div key={item.step}>
            <div className='w-8 h-8 rounded-full bg-accent/20 text-accent text-sm font-bold flex items-center justify-center mx-auto mb-2'>
              {item.step}
            </div>
            <p className='text-white text-sm font-medium mb-1'>{item.title}</p>
            <p className='text-slate-500 text-xs'>{item.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}