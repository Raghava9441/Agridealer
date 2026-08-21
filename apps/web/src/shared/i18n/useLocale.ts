import { useAppDispatch, useAppSelector } from '@/store'
import { localeSet, selectPreferences } from '@/store/slices/preferencesSlice'

export function useLocale() {
  const dispatch = useAppDispatch()
  const { locale } = useAppSelector(selectPreferences)
  return {
    locale,
    setLocale: (locale: string) => dispatch(localeSet(locale)),
  }
}
