import { useTranslation } from 'react-i18next'
import type { ContentSource } from './contentSource'

/**
 * The active ContentSource — swap this one line for a headless-CMS-backed
 * implementation later; every `useContent()` call site is unaffected.
 * Implemented inline (not a separate `contentSource.local.ts` file) because
 * react-i18next's `t()` must be called as a hook, not a plain function, so
 * the "local" ContentSource can't be a static object the way a future
 * fetch-based CMS source could be.
 */
export function useContent(): ContentSource {
  const { t } = useTranslation()
  return {
    get: (key, params) => t(key, params),
  }
}
