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
        'whitespace-nowrap border-b border-border bg-bg/100 px-4 py-4 text-md font-bold text-muted',
        className,
      )}
    />
  )
}

export function Td({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cn('border-b border-border px-4 py-3 align-middle', className)} />
}

export function Tr({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} className={cn('hover:bg-bg/20', className)} />
}
