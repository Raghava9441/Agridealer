/**
 * Locale-aware formatting via native `Intl` — no date library needed for
 * what this app does (format/parse, no timezone-heavy arithmetic).
 * `locale` is passed in by callers from `preferencesSlice` rather than
 * read globally here, so these stay pure/testable functions.
 */

export function formatDate(date: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date))
}

export function formatDateTime(date: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}

/** Backend amounts are always integer paise (see dbstructure.md) — divide by 100 once, here, rather than in every component. */
export function formatMoney(paise: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'INR' }).format(paise / 100)
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value)
}
