import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex h-[34px] min-h-[34px] items-center justify-center gap-1.5 rounded-[7px] px-3 text-[11px] font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        default:
          'border border-border-strong bg-white text-dark-normal-active hover:bg-surface-light hover:border-[#D2D8DF]',
        primary:
          'border border-blue-normal bg-blue-normal text-white hover:bg-blue-normal-hover active:bg-blue-normal-active',
        ghost:
          'border border-transparent bg-transparent text-dark-normal-active hover:bg-surface-normal-hover',
        destructive:
          'border border-danger-border bg-danger-bg text-danger-fg hover:bg-danger-bg/80',
      },
      size: {
        default: 'h-[34px] px-3',
        icon: 'h-[34px] w-[34px] px-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? 'Submitting...' : children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
