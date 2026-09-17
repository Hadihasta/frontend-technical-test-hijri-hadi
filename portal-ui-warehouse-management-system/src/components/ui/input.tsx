import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-[34px] w-full rounded-[7px] border border-border-strong bg-white px-2.5 text-[11px] text-dark-active placeholder:text-dark-light-active disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[#D6AAB5] bg-[#FFFDFD]',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
