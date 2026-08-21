import { useEffect, type ReactNode } from 'react'
import i18next from './index'
import { applyDocumentDirection } from './rtl'
import { useAppSelector } from '@/store'
import { selectPreferences } from '@/store/slices/preferencesSlice'

/**
 * Applies the persisted locale preference (Redux preferencesSlice — the
 * single source of truth) to i18next and to the document's text direction,
 * same state-to-external-system shape as theme/ThemeProvider.tsx. Without
 * this, i18next stays hardcoded to the `lng: 'en'` set at init time no
 * matter what a user picks, and `dir`/`lang` on <html> never move off
 * whatever index.html hardcoded — Arabic would render LTR.
 */
export function I18nSync({ children }: { children: ReactNode }) {
  const { locale } = useAppSelector(selectPreferences)

  useEffect(() => {
    void i18next.changeLanguage(locale)
    applyDocumentDirection(locale)
  }, [locale])

  return children
}
