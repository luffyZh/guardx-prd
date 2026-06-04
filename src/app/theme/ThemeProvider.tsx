import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ThemeMode } from '../../types/auth'
import { ThemeContext } from './useTheme'
import type { ThemeContextValue } from './useTheme'

const storageKey = 'guardx.theme'

function readStoredTheme(): ThemeMode {
  const raw = localStorage.getItem(storageKey)
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  return 'system'
}

function resolveIsDark(mode: ThemeMode) {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function applyThemeClass(isDark: boolean) {
  const root = document.documentElement
  if (isDark) root.classList.add('dark')
  else root.classList.remove('dark')
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredTheme())
  const [systemDark, setSystemDark] = useState<boolean>(() => resolveIsDark('system'))

  const isDark = useMemo(() => {
    if (mode === 'dark') return true
    if (mode === 'light') return false
    return systemDark
  }, [mode, systemDark])

  useEffect(() => {
    applyThemeClass(isDark)
    localStorage.setItem(storageKey, mode)
  }, [mode, isDark])

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return

    const onChange = () => {
      setSystemDark(mq.matches)
    }

    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setMode = useCallback((m: ThemeMode) => setModeState(m), [])

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const base = prev === 'system' ? (resolveIsDark('system') ? 'dark' : 'light') : prev
      return base === 'dark' ? 'light' : 'dark'
    })
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, isDark, setMode, toggle }),
    [mode, isDark, setMode, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
