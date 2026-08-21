import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

/** `aria-hidden` — a skeleton is a visual loading affordance only; screen readers should hear the surrounding "loading" state, not a row of empty divs. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn('animate-pulse rounded bg-muted', className)} {...props} />
}
