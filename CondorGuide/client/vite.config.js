import { defineConfig } from 'vite'


export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: '${import.meta.env.VITE_API_BASE_URL}',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});