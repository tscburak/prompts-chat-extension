import { crx } from '@crxjs/vite-plugin'

import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'
import manifest from './manifest.config'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  legacy: {
    skipWebSocketTokenCheck: true,
  },
  server: {
    cors: {
      origin: '*'
    }
  },
})
