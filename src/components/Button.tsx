import { cn } from '../lib/cn'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/60 disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' && 'h-8 px-3 py-1 text-xs',
        size === 'md' && 'h-10',
        variant === 'primary' &&
          'border-brand-700 bg-brand-700 text-white hover:border-brand-800 hover:bg-brand-800',
        variant === 'secondary' && 'border-border bg-surface text-fg hover:shadow-cardHover',
        variant === 'danger' && 'border-status-danger/60 bg-status-danger text-white hover:opacity-95',
        variant === 'ghost' && 'border-transparent bg-transparent text-fg hover:bg-border/30',
        className,
      )}
    />
  )
}

