import { AuthProvider } from '../auth/AuthProvider'
import { ThemeProvider } from '../theme/ThemeProvider'
import { ToastProvider } from '../toast/ToastProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

