import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative Pfade funktionieren überall (Vercel, lokaler Server, GitHub Pages).
  // Der alte feste Pfad '/Thumnail_Generator/' ergab auf Vercel eine weiße Seite.
  // Bei Bedarf überschreibbar: VITE_BASE=/Thumnail_Generator/ npm run build
  base: process.env.VITE_BASE || './',
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    cors: true
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'jszip', 'tesseract.js']
  }
})
