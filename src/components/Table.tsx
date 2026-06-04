import { cn } from '../lib/cn'

export function Table({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  )
}

export function Th({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={cn(
        'whitespace-nowrap border-b border-border bg-bg/20 px-3 py-2 text-xs font-semibold text-muted',
        className,
      )}
    />
  )
}

export function Td({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cn('border-b border-border px-3 py-2 align-middle', className)} />
}

export function Tr({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} className={cn('hover:bg-bg/20', className)} />
}

