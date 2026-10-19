import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Actions supplies the actual repository path, including user Pages repositories.
export default defineConfig({
  plugins: [react()],
  base: process.env.PAGES_BASE_PATH || '/',
  build: { chunkSizeWarningLimit: 700 },
})
