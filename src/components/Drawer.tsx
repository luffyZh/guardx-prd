import { cn } from '../lib/cn'
import { Button } from './Button'

export function Drawer({
  title,
  open,
  onClose,
  children,
  footer,
  widthClassName = 'w-full max-w-[520px]',
}: {
  title?: string
  open: boolean
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  widthClassName?: string
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/40" aria-label="Close" />
      <div className={cn('absolute right-0 top-0 z-10 flex h-full flex-col border-l border-border bg-surface shadow-cardHover', widthClassName)}>
        {(title || footer) && (
          <div className="flex items-center justify-between gap-3 border-b border-border p-5">
            <div className="text-base font-semibold text-fg">{title}</div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              关闭
            </Button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-auto p-5">{children}</div>
        {footer && <div className="border-t border-border p-5">{footer}</div>}
      </div>
    </div>
  )
}

