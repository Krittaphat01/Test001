import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true, // บังคับให้ Vite rebuild deps ใหม่
  },
  test: {
    globals: true,
    environment: "jsdom", //  จำลอง DOM สำหรับ React
    setupFiles: "./src/test/setup.js",
    include: ["src/**/*.test.{js,jsx}"], // ✅ บอกว่า test อยู่ตรงไหน
    testTimeout: 10000,
  },
})
