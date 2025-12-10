import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    https: true,
    host: 'localhost',  // upewnij się, że host jest poprawny
    port: 5173
  }
})
