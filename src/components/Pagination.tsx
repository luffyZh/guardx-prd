import { cn } from '../lib/cn'
import { Button } from './Button'

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (next: number) => void
  className?: string
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="text-xs text-muted">
        共 {total} 条 · 第 {page}/{totalPages} 页
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" disabled={!canPrev} onClick={() => onPageChange(1)}>
          首页
        </Button>
        <Button size="sm" disabled={!canPrev} onClick={() => onPageChange(page - 1)}>
          上一页
        </Button>
        <Button size="sm" disabled={!canNext} onClick={() => onPageChange(page + 1)}>
          下一页
        </Button>
        <Button size="sm" disabled={!canNext} onClick={() => onPageChange(totalPages)}>
          末页
        </Button>
      </div>
    </div>
  )
}

