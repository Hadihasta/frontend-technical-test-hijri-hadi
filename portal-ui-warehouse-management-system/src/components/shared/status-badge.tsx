import { cn } from '@/lib/utils'
import { formatStatusLabel } from '@/lib/format'
import type { PurchaseOrderStatus, PurchaseRequestStatus } from '@/types'

type StatusValue = PurchaseRequestStatus | PurchaseOrderStatus | string

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-surface-normal text-dark-normal border-border',
  SUBMITTED: 'bg-blue-light text-blue-normal border-[#D8E2EF]',
  APPROVED: 'bg-success-bg text-success-fg border-success-border',
  REJECTED: 'bg-danger-bg text-danger-fg border-danger-border',
  ORDERED: 'bg-blue-light text-blue-normal border-[#D8E2EF]',
  PARTIALLY_RECEIVED: 'bg-warning-bg text-warning-fg border-warning-border',
  RECEIVED: 'bg-success-bg text-success-fg border-success-border',
  CANCELLED: 'bg-surface-normal text-dark-normal border-border',
}

interface StatusBadgeProps {
  status: StatusValue
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[5px] border px-1.5 py-0.5 text-[9.5px] font-medium',
        statusStyles[status] ?? statusStyles.DRAFT,
        className,
      )}
    >
      {formatStatusLabel(status)}
    </span>
  )
}
