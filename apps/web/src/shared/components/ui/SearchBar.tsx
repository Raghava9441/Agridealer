import { useEffect, useState } from 'react'
import { Input } from './Input'
import { useContent } from '@/cms/useContent'

/** Debounces onSearch so a DataTable's server-side search filter doesn't fire on every keystroke. */
export function SearchBar({
  value,
  onSearch,
  placeholderKey = 'common.search',
  debounceMs = 300,
}: {
  value: string
  onSearch: (value: string) => void
  placeholderKey?: string
  debounceMs?: number
}) {
  const [draft, setDraft] = useState(value)
  // "Adjusting state when a prop changes" (React docs pattern) instead of an
  // effect that calls setState — avoids the extra render-then-effect-then-
  // render cascade a `useEffect(() => setDraft(value), [value])` would cause.
  const [trackedValue, setTrackedValue] = useState(value)
  if (value !== trackedValue) {
    setTrackedValue(value)
    setDraft(value)
  }

  const content = useContent()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft !== value) onSearch(draft)
    }, debounceMs)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  return (
    <Input
      type="search"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      placeholder={content.get(placeholderKey)}
      aria-label={content.get(placeholderKey)}
    />
  )
}
