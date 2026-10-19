import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import it from './locales/it.json'
import en from './locales/en.json'

export function readPreference(key: string) {
  try { return localStorage.getItem(key) } catch { return null }
}
export function savePreference(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* Private browsing: keep in memory. */ }
}
const language = readPreference('sp-language') === 'en' ? 'en' : 'it'
void i18n.use(initReactI18next).init({
  resources: { it: { translation: it }, en: { translation: en } },
  lng: language,
  fallbackLng: 'it',
  interpolation: { escapeValue: false },
})
export default i18n
