import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  htmlFor?: string
  helperText?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  helperText,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-[10px] text-danger-fg" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[10px] text-dark-light-active">{helperText}</p>
      ) : null}
    </div>
  )
}
