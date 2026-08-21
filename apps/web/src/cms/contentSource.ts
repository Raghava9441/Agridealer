/**
 * Same pluggable-strategy idiom as core/auth/authStrategy.ts. `localContentSource`
 * (contentSource.local.ts) is the only implementation today, backed by the
 * existing en/te/hi JSON bundles (shared/i18n) via react-i18next — every
 * label/title/validation-message/empty-state string in the app should be
 * fetched through `useContent()`, never a literal string, so that swapping
 * in a headless CMS later is "write one new ContentSource," not "find and
 * replace every component."
 */
export interface ContentSource {
  get(key: string, params?: Record<string, string | number>): string
}
