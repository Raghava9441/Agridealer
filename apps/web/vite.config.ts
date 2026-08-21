/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * TanStackRouterVite generates routes/routeTree.gen.ts from the file-based
 * route tree on every build/dev start (docs §5.2.1) — it must run before
 * the React plugin. VitePWA gives the offline app-shell + catalogue cache
 * described in docs §5.9/§12.2; the actual runtime caching strategy for
 * the product catalogue is refined once the products module exists.
 */
export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: './src/routes', generatedRouteTree: './src/routeTree.gen.ts' }),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: {
        name: 'AgriDealer ERP',
        short_name: 'AgriDealer',
        theme_color: '#1a7a43',
        display: 'standalone',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Bind all interfaces and accept *.localhost Host headers so
    // demo-a.localhost:5173 etc. reach this dev server (subdomain tenancy).
    host: true,
    allowedHosts: ['.localhost'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/shared/testing/setupTests.ts'],
  },
})
