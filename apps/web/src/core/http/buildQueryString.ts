/**
 * Every list() endpoint across modules/*\/api builds a query string from an
 * optional-filters object (search, status, vendorId, ...) — this used to be
 * hand-rolled per file (single-param `?search=${encodeURIComponent(x)}`),
 * which doesn't scale once a module has more than one filter. `undefined`
 * keys are dropped so callers can pass a whole filters object through
 * without pre-checking which fields are actually set.
 */
/**
 * Takes `object`, not `Record<string, ...>` — a plain `interface Foo {
 * search?: string }` (every module's ListFilter) has no index signature, and
 * TS rejects those at a Record-typed parameter even though every property is
 * individually compatible. Values are expected to be
 * `string | number | boolean | undefined` by convention (every ListFilter
 * interface declares only those), enforced by each call site's own type, not
 * by this function's signature.
 */
export function buildQueryString(params: object): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) qs.set(key, String(value))
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}
