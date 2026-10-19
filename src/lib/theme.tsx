import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { readPreference, savePreference } from '../i18n'
type Theme = 'light' | 'dark'
const ThemeContext = createContext<{theme: Theme; toggle: () => void}>({ theme: 'light', toggle: () => {} })
const initial = readPreference('sp-theme')
const system = window.matchMedia('(prefers-color-scheme: dark)')
const initialTheme = initial === 'light' || initial === 'dark' ? initial : system.matches ? 'dark' : 'light'
document.documentElement.dataset.theme = initialTheme
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#11221c' : '#f7f8f2')
  }, [theme])
  useEffect(() => {
    const update = (event: MediaQueryListEvent) => { if (!readPreference('sp-theme')) setTheme(event.matches ? 'dark' : 'light') }
    system.addEventListener('change', update)
    return () => system.removeEventListener('change', update)
  }, [])
  return <ThemeContext.Provider value={{ theme, toggle: () => setTheme(value => {
    const next = value === 'light' ? 'dark' : 'light'
    savePreference('sp-theme', next)
    return next
  }) }}>{children}</ThemeContext.Provider>
}
export const useTheme = () => useContext(ThemeContext)
