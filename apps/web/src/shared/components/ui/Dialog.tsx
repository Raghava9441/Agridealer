import type { ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { cn } from '@/shared/lib/cn'

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <RadixDialog.Content
          className={cn(
            // Fixed positioning means document scroll can't reach this element at
            // all — without its own max-height + overflow-y-auto, a form with
            // enough fields (10+, e.g. the Products edit form) renders its submit
            // button entirely off-screen with no way to reach it on anything
            // shorter than a very tall monitor. Found by actually testing the
            // Products edit dialog, not by inspection.
            'fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded border border-muted bg-surface shadow-xl',
            className,
          )}
        >
          <div className="p-6 pb-0">
            <RadixDialog.Title className="text-lg font-semibold">{title}</RadixDialog.Title>
            {description && (
              <RadixDialog.Description className="mt-1 text-sm text-muted-foreground">
                {description}
              </RadixDialog.Description>
            )}
          </div>
          <div className="overflow-y-auto p-6">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
