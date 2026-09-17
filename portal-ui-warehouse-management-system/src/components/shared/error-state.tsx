import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Unable to load data',
  description = 'Something went wrong while retrieving data.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center px-6 py-8 text-center">
      <div className="mb-2.5 flex h-[38px] w-[38px] items-center justify-center rounded-[9px] border border-border bg-surface-normal">
        <AlertCircle className="h-4 w-4 text-danger-fg" aria-hidden="true" />
      </div>
      <h4 className="text-[13px] font-medium text-dark-active">{title}</h4>
      <p className="mt-1 max-w-sm text-[10px] text-dark-normal">{description}</p>
      {onRetry ? (
        <Button className="mt-2.5" onClick={onRetry}>
          Try Again
        </Button>
      ) : null}
    </div>
  )
}
