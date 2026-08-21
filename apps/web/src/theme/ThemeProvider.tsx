import { useEffect, type ReactNode } from 'react'
import { useAppSelector } from '@/store'
import { selectTheme } from '@/store/slices/themeSlice'

function resolveIsDark(mode: 'light' | 'dark' | 'system'): boolean {
  if (mode === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches
  return mode === 'dark'
}

/**
 * Applies theme state (Redux themeSlice — the single source of truth) to
 * the DOM: toggles the `.dark` class the existing `styles/tailwind.css`
 * design tokens already key off, and overrides `--color-brand` when a
 * tenant brand color is set. No new CSS variables invented — reuses the
 * ones already defined for exactly this purpose (docs §5.6.1).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { mode, brandColor } = useAppSelector(selectTheme)

  useEffect(() => {
    const root = document.documentElement
    const apply = () => root.classList.toggle('dark', resolveIsDark(mode))
    apply()

    if (mode !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [mode])

  useEffect(() => {
    if (brandColor) {
      document.documentElement.style.setProperty('--color-brand', brandColor)
    } else {
      document.documentElement.style.removeProperty('--color-brand')
    }
  }, [brandColor])

  return children
}
