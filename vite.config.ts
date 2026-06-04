import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: (() => {
    if (!process.env.GITHUB_ACTIONS) return '/'
    const repo = (process.env.GITHUB_REPOSITORY ?? '').split('/')[1]
    return repo ? `/${repo}/` : '/'
  })(),
  plugins: [react()],
})
