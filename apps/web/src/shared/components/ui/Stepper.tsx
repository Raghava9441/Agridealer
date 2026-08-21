import { cn } from '@/shared/lib/cn'

export function Stepper({ steps, activeIndex }: { steps: string[]; activeIndex: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium',
              i < activeIndex && 'border-brand bg-brand text-brand-fg',
              i === activeIndex && 'border-brand text-brand',
              i > activeIndex && 'border-muted text-muted-foreground',
            )}
            aria-current={i === activeIndex ? 'step' : undefined}
          >
            {i + 1}
          </span>
          <span className={cn('text-sm', i === activeIndex ? 'font-medium' : 'text-muted-foreground')}>{step}</span>
          {i < steps.length - 1 && <span aria-hidden className="mx-1 h-px w-6 bg-muted" />}
        </li>
      ))}
    </ol>
  )
}
