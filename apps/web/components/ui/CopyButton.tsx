'use client'

import { useState } from 'react'

interface CopyButtonProps {
  text: string
  label?: string
}

export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      // navigator.clipboard is the modern clipboard API
      // writeText returns a Promise — must be awaited
      setCopied(true)
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can fail if the page isn't focused
      // or if the browser denies permission — handle silently
      console.error('Failed to copy')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`
        text-xs px-2.5 py-1 rounded-md font-medium
        transition-all duration-150
        ${copied
          ? 'bg-success/15 text-success border border-success/20'
          : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-border'
        }
      `}
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}