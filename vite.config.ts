import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    // Dev only: the browser asks Vite (same origin) and Vite asks CNB, which avoids CORS.
    proxy: {
      '/daily.txt': {
        target: 'https://www.cnb.cz',
        changeOrigin: true,
        rewrite: () =>
          '/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/daily.txt',
      },
    },
  },
})
