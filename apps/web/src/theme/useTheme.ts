import { useAppDispatch, useAppSelector } from '@/store'
import { modeSet, selectTheme, type ThemeMode } from '@/store/slices/themeSlice'

export function useTheme() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)
  return {
    mode: theme.mode,
    setMode: (mode: ThemeMode) => dispatch(modeSet(mode)),
  }
}
