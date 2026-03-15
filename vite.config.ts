import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  preview:{
    allowedHosts: ['bidsconnect.co.tz', 'www.bidsconnect.co.tz', 'api.bidsconnect.co.tz', 'https://api.bidsconnect.co.tz', 'https://www.bidsconnect.co.tz'],
  },
  build: {
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'primevue': ['primevue'],
          'charts': ['apexcharts', 'chart.js', 'vue3-apexcharts'],
        },
      },
    },
  },
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

  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'if-function', 'global-builtin', 'color-functions'],
      }
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