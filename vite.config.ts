import { fileURLToPath, URL } from 'node:url'
import { existsSync, readFileSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

const hasCerts = existsSync('./certs/localhost+2-key.pem')

// https://vite.dev/config/
export default defineConfig({
  server: {
    https: hasCerts ? {
      key: readFileSync('./certs/localhost+2-key.pem'),
      cert: readFileSync('./certs/localhost+2.pem'),
    } : undefined,
    allowedHosts: true,
  },
  plugins: [
    tailwindcss(),
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
