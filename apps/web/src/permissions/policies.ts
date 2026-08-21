import type { AbacPolicy } from './abac'

/**
 * Registry of ABAC policies, keyed by action name. Deliberately empty today —
 * every gating rule this app currently needs (role → permission) is covered
 * by RBAC alone via `@agridealer/contracts`'s permission matrix, and
 * inventing an attribute-based rule with nothing in the backend to back it
 * (e.g. a fake plan-tier gate) would be exactly the kind of unvalidated
 * business rule this project has deliberately avoided guessing at all
 * session (see dbstructure.md's "what's intentionally not built yet").
 *
 * The engine (`evaluateAbac`) is fully wired and used by `useCan()` — add a
 * policy here the moment a real attribute-based rule exists, e.g.:
 *
 *   { action: 'invoice:cancel', rules: [isResourceOwner()] }
 *
 * and every `useCan('invoice:cancel', { ownerId })` call site picks it up
 * with no other code change.
 */
export const POLICIES: AbacPolicy[] = []
