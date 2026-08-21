import { appConfig } from '@/bootstrap/config'
import { useAppDispatch, useAppSelector } from '@/store'
import { overrideCleared, overrideSet } from '@/store/slices/featureFlagsSlice'
import { selectTenant } from '@/store/slices/tenantSlice'

/** Dev-only runtime flag override panel — lets a developer preview a flag before the backend tenant actually has it in `tenant.features`. Renders nothing outside development. */
export function FeatureFlagDevPanel() {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const overrides = useAppSelector((state) => state.featureFlags.overrides)

  if (appConfig.environment !== 'development') return null

  const known = Array.from(new Set([...tenant.features, ...Object.keys(overrides)]))

  return (
    <div className="fixed bottom-4 end-4 z-50 w-64 rounded border border-muted bg-surface p-3 text-xs shadow-lg">
      <div className="mb-2 font-semibold">Feature flags (dev)</div>
      {known.length === 0 && <p className="text-muted-foreground">No flags on this tenant yet.</p>}
      {known.map((key) => {
        const override = overrides[key]
        const effective = override ?? tenant.features.includes(key)
        return (
          <label key={key} className="flex items-center justify-between gap-2 py-1">
            <span className={override !== undefined ? 'italic' : undefined}>{key}</span>
            <input
              type="checkbox"
              checked={effective}
              onChange={(e) => dispatch(overrideSet({ key, value: e.target.checked }))}
            />
            {override !== undefined && (
              <button
                type="button"
                className="text-muted-foreground underline"
                onClick={() => dispatch(overrideCleared(key))}
              >
                reset
              </button>
            )}
          </label>
        )
      })}
    </div>
  )
}
