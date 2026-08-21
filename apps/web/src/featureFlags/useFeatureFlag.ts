import { useAppSelector } from '@/store'
import { selectFeatureFlag } from '@/store/slices/featureFlagsSlice'

/**
 * No separate React Context "FeatureFlagProvider" — the flag state already
 * lives in Redux (featureFlagsSlice), and Redux's own `<Provider>` (wired
 * in app/providers.tsx) is what makes it available app-wide. Adding a
 * second Context around the same state would just be the "duplicate server
 * state" anti-pattern the architecture explicitly rules out, applied to
 * client state instead.
 */
export function useFeatureFlag(key: string): boolean {
  return useAppSelector(selectFeatureFlag(key))
}
