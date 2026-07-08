import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { EVENT } from './src/config/event.ts'

const BASE_PATH = '/event-companion/'

// Fills the %EVENT_*% placeholders in index.html from the same config used
// for the PWA manifest, so branding only needs to change in one place.
function eventHtmlPlugin(): Plugin {
  return {
    name: 'event-html-vars',
    transformIndexHtml(html) {
      return html
        .replace(/%EVENT_TITLE%/g, EVENT.fullName)
        .replace(/%EVENT_SHORT_NAME%/g, EVENT.shortName)
        .replace(/%EVENT_DESCRIPTION%/g, EVENT.description)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    eventHtmlPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png', EVENT.logo],
      manifest: {
        name: EVENT.fullName,
        short_name: EVENT.shortName,
        description: EVENT.description,
        start_url: BASE_PATH,
        scope: BASE_PATH,
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
