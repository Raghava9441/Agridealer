import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded border border-muted bg-surface px-3 text-base outline-none focus:ring-2 focus:ring-brand',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
