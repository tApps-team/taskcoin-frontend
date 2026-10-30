import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev server proxies API and uploaded files to the FastAPI backend so the
// frontend can use relative URLs (no CORS juggling in development).
// Point it elsewhere with VITE_PROXY_TARGET to run the UI against a deployed
// backend — useful for checking a redesign against real data.
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: proxyTarget, changeOrigin: true },
      '/uploads': { target: proxyTarget, changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split big vendors into their own chunks so they download in parallel
        // and stay cached across deploys (their hash changes only when they do).
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (id.includes('/framer-motion/')) return 'motion'
          if (
            id.includes('/@reduxjs/') ||
            id.includes('/react-redux/') ||
            id.includes('/redux/') ||
            id.includes('/immer/') ||
            id.includes('/reselect/')
          )
            return 'redux'
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router/') ||
            id.includes('/react-router-dom/') ||
            id.includes('/scheduler/')
          )
            return 'react'
        },
      },
    },
  },
})
