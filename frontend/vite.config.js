import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      external: [], // Se till att detta är tomt
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          crypto: ['crypto-js'],
          animation: ['gsap'] // Lägg till GSAP här
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'crypto-js', 'gsap'] // Lägg till GSAP här
  }
})