import type { HttpMethod } from '@/types'

interface MethodBadgeProps {
  method: HttpMethod
}

// Each HTTP method gets a distinct color — standard convention devs recognize
const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  POST: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  PUT: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  PATCH: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  DELETE: 'bg-red-500/15 text-red-400 border-red-500/20',
  HEAD: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  OPTIONS: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
}

export function MethodBadge({ method }: MethodBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-xs font-mono font-semibold
        rounded border
        ${METHOD_COLORS[method] ?? METHOD_COLORS.GET}
      `}
    >
      {method}
    </span>
  )
}