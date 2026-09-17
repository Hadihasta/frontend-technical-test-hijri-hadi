import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[86px] w-full rounded-[7px] border border-border-strong bg-white px-2.5 py-2.5 text-[11px] text-dark-active placeholder:text-dark-light-active disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[#D6AAB5] bg-[#FFFDFD]',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
