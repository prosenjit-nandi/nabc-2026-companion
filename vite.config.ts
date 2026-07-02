import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/nabc-2026-companion/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png', 'nabc-logo.png'],
      manifest: {
        name: 'NABC 2026 Companion',
        short_name: 'NABC Companion',
        description: 'Live schedule companion for NABC 2026',
        start_url: '/nabc-2026-companion/',
        scope: '/nabc-2026-companion/',
        display: 'standalone',
        background_color: '#fff7e8',
        theme_color: '#116466',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: /\/data\/schedule\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'schedule-data',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 4 },
            },
          },
        ],
      },
    }),
  ],
})
