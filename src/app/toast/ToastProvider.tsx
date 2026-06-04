import { useCallback, useMemo, useState } from 'react'
import { createId } from '../../lib/id'
import { cn } from '../../lib/cn'
import { ToastContext } from './useToast'
import type { ToastContextValue, ToastKind } from './useToast'

interface ToastItem {
  id: string
  kind: ToastKind
  message: string
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = createId('toast')
    setItems((prev) => [...prev, { id, kind, message }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 2800)
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value as ToastContextValue}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto rounded-xl border bg-surface px-4 py-3 text-sm shadow-card',
              t.kind === 'success' && 'border-status-success/40',
              t.kind === 'error' && 'border-status-danger/40',
              t.kind === 'info' && 'border-status-info/40',
            )}
          >
            <div className="text-fg">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
