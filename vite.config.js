import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true, // บังคับให้ Vite rebuild deps ใหม่
  },
})
