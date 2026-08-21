export const RTL_LOCALES = new Set(['ar'])

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale)
}

/**
 * Applied both synchronously at module load (preferencesSlice.ts — avoids a
 * flash of the wrong direction before React ever renders) and reactively on
 * locale change (I18nSync.tsx).
 */
export function applyDocumentDirection(locale: string): void {
  document.documentElement.dir = isRtlLocale(locale) ? 'rtl' : 'ltr'
  document.documentElement.lang = locale
}
