import { useEffect, useMemo, useRef, useState } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { useContent } from '@/cms/useContent'
import { cn } from '@/shared/lib/cn'

export interface Command {
  id: string
  label: string
  run: () => void
}

/**
 * Keyboard-driven command list in a Dialog — no `cmdk` dependency, since a
 * simple filtered list covers what this app needs today (jump to a module).
 * `commands` comes from the caller (see layouts/AppShell.tsx, which builds
 * the list from config/navigation.ts) rather than being hardcoded here.
 */
export function CommandPalette({
  open,
  onOpenChange,
  commands,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  commands: Command[]
}) {
  const [query, setQuery] = useState('')
  const content = useContent()
  const inputRef = useRef<HTMLInputElement>(null)

  // Programmatic focus on open, not the `autoFocus` prop (jsx-a11y flags autoFocus since it can disorient screen-reader
  // users on page load — but this is a modal the user just explicitly opened, where focusing the input is expected).
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const filtered = useMemo(
    () => commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())),
    [commands, query],
  )

  return (
    <RadixDialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setQuery('')
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <RadixDialog.Content className="fixed left-1/2 top-24 z-50 w-full max-w-md -translate-x-1/2 rounded border border-muted bg-surface shadow-xl">
          <RadixDialog.Title className="sr-only">{content.get('commandPalette.title')}</RadixDialog.Title>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={content.get('commandPalette.placeholder')}
            className="w-full border-b border-muted bg-transparent px-4 py-3 text-sm outline-none"
          />
          <ul className="max-h-72 overflow-y-auto py-1" role="listbox">
            {filtered.map((cmd) => (
              <li key={cmd.id}>
                <button
                  type="button"
                  className={cn('block w-full px-4 py-2 text-start text-sm hover:bg-muted')}
                  onClick={() => {
                    cmd.run()
                    onOpenChange(false)
                  }}
                >
                  {cmd.label}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground">{content.get('commandPalette.noResults')}</li>
            )}
          </ul>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
