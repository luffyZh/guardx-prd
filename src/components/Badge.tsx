import { cn } from '../lib/cn'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'brand'

export function Badge({
  tone = 'muted',
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium',
        tone === 'muted' && 'border-border text-muted',
        tone === 'brand' && 'border-brand-600/40 text-brand-700 dark:text-brand-600',
        tone === 'success' && 'border-status-success/40 text-status-success',
        tone === 'warning' && 'border-status-warning/40 text-status-warning',
        tone === 'danger' && 'border-status-danger/40 text-status-danger',
        tone === 'info' && 'border-status-info/40 text-status-info',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusDot({ tone = 'muted' }: { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full',
        tone === 'muted' && 'bg-border',
        tone === 'brand' && 'bg-brand-700',
        tone === 'success' && 'bg-status-success',
        tone === 'warning' && 'bg-status-warning',
        tone === 'danger' && 'bg-status-danger',
        tone === 'info' && 'bg-status-info',
      )}
    />
  )
}

