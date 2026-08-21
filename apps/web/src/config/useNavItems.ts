import { useAppSelector } from '@/store'
import { selectGrantedPermissions } from '@/store/slices/permissionsSlice'
import { NAV_ITEMS, type NavItem } from './navigation'

/** One selector read, filtered in plain JS — avoids calling a per-item hook in a loop (Rules of Hooks). */
export function useNavItems(): NavItem[] {
  const granted = useAppSelector(selectGrantedPermissions)
  const flagState = useAppSelector((state) => state.featureFlags)

  return NAV_ITEMS.filter((item) => {
    if (item.permission && !granted.includes(item.permission)) return false
    if (item.featureFlag) {
      const enabled = flagState.overrides[item.featureFlag] ?? flagState.resolved.includes(item.featureFlag)
      if (!enabled) return false
    }
    return true
  })
}
