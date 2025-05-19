import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // default is set to backend but i don't actually know if i need this

      '/api': 'http://localhost:5001',
    }
  }
})
