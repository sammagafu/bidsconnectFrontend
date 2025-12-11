import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    Components({
      resolvers: [BootstrapVueNextResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // THIS IS THE MAGIC — PROXIES ALL /api/v1/ CALLS TO YOUR LIVE SERVER
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://bidsconnect.co.tz',
        changeOrigin: true,
        secure: true,           // accepts valid Let's Encrypt cert
        rewrite: (path) => path.replace(/^\/api/, '/api')  // keeps /api/v1/... intact
      },
      // Optional: proxy static files too (admin + DRF styling)
      '/static': {
        target: 'https://bidsconnect.co.tz',
        changeOrigin: true,
        secure: true,
      },
      '/media': {
        target: 'https://bidsconnect.co.tz',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})