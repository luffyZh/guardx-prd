import { cn } from '../lib/cn'
import { Button } from './Button'

export function Modal({
  title,
  open,
  onClose,
  children,
  footer,
}: {
  title?: string
  open: boolean
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
      />
      <div className="relative z-10 w-full max-w-[720px] rounded-2xl border border-border bg-surface shadow-cardHover">
        {(title || footer) && (
          <div className="flex items-center justify-between gap-3 border-b border-border p-5">
            <div className="text-base font-semibold text-fg">{title}</div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              关闭
            </Button>
          </div>
        )}
        <div className={cn('p-5', !title && 'pt-5')}>{children}</div>
        {footer && <div className="border-t border-border p-5">{footer}</div>}
      </div>
    </div>
  )
}

export function Confirm({
  open,
  title,
  description,
  confirmText = '确认',
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>取消</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="text-sm text-muted">{description}</div>
    </Modal>
  )
}

