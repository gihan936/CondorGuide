import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  optimizeDeps: {
    include: ['framer-motion'],
  },
  plugins: [react()]
})
