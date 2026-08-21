import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import te from './te.json'
import hi from './hi.json'
import ar from './ar.json'

/** English, Telugu, Hindi, Arabic bundles per docs §4.1, §5.6.2. Arabic is RTL — see rtl.ts. */
void i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    te: { translation: te },
    hi: { translation: hi },
    ar: { translation: ar },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18next
