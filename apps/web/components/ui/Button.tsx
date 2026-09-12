import type { ButtonHTMLAttributes, ReactNode } from 'react'

// Extend native button attributes so all standard button props still work
// e.g. onClick, disabled, type — you get all of these for free
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  children: ReactNode
  isLoading?: boolean
}

const variants = {
  primary: 'bg-accent hover:bg-accent-hover text-white',
  ghost: 'bg-white/5 hover:bg-white/10 text-slate-300 border border-border',
  danger: 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading,
  disabled,
  className = '',
  ...props
  // ...props spreads the rest of the native button attributes
  // so onClick, type, etc. still work without explicitly forwarding them
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center gap-2 rounded-lg font-medium
        transition-colors duration-150 disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        // Simple CSS spinner — no library needed
        <span className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
      ) : null}
      {children}
    </button>
  )
}