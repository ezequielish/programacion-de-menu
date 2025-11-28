import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  server: {
    // ESTA ES LA SECCIÓN QUE DEBES AÑADIR O MODIFICAR
    allowedHosts: [
      'sharp-rocks-brake.loca.lt', // Tu dominio específico
      'loca.lt', // Dominio raíz
      'localhost', // Opcional, si no está
      '127.0.0.1', // Opcional, si no está
    ],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
