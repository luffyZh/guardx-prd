import { cn } from '../lib/cn'

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={cn('text-sm font-medium text-fg', className)} />
}

export function Hint({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('text-xs text-muted', className)} />
}

export function ErrorText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('text-xs text-status-danger', className)} />
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-fg outline-none transition placeholder:text-muted focus:border-brand-600/60 focus:ring-2 focus:ring-brand-600/20',
        className,
      )}
    />
  )
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-fg outline-none transition focus:border-brand-600/60 focus:ring-2 focus:ring-brand-600/20',
        className,
      )}
    />
  )
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-[96px] w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition placeholder:text-muted focus:border-brand-600/60 focus:ring-2 focus:ring-brand-600/20',
        className,
      )}
    />
  )
}

