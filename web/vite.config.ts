import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'AcuaCore AI - Operaciones',
        short_name: 'AcuaCore',
        description: 'Plataforma de IA para la Gestión Acuícola',
        theme_color: '#003B71',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    headers: {
      'ngrok-skip-browser-warning': 'true'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3014',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3014',
        ws: true,
      },
    },
  },
})
