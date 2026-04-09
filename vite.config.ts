import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import packageJson from './package.json'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Keep your TanStack condition fix
    conditions: ['@tanstack/custom-condition'],
  },

  // Vitest config (kept exactly as you had it)
  test: {
    name: packageJson.name,
    dir: './src',
    watch: false,
    globals: true,
    coverage: {
      enabled: true,
      provider: 'istanbul',
      include: ['src/**/*.{js,ts,cjs,mjs,jsx,tsx}'],
    },
    typecheck: { enabled: true },
    restoreMocks: true,
  },
})