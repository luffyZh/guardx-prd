import { cn } from '../lib/cn'

export function Tabs({
  value,
  options,
  onChange,
}: {
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (next: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition',
            value === opt.value
              ? 'border-brand-600/50 bg-brand-700 text-white'
              : 'border-border bg-surface text-fg hover:bg-bg/30',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

