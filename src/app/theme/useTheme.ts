import { createContext, useContext } from 'react'
import type { ThemeMode } from '../../types/auth'

export interface ThemeContextValue {
  mode: ThemeMode
  isDark: boolean
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('ThemeProvider missing')
  return ctx
}

