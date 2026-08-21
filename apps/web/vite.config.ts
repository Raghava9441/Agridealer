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
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      autoCodeSplitting: true,
    }),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-32x32.png', 'favicon-16x16.png', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // The API lives on its own origin (apiBaseUrl, see bootstrap/config.ts)
        // so these match by path rather than a build-time-known host — that
        // works cross-origin because urlPattern callbacks run against every
        // fetch event regardless of destination origin.
        //
        // Only tenant-wide reference data goes in the allow-list below
        // (product catalog, public tenant info) — never transactional
        // records like customers/inventory/invoices, where serving a stale
        // balance or stock count could cause a real business error. Mirrors
        // worklenz-frontend's split between its CACHEABLE_API_PATTERNS
        // (reference data) and NEVER_CACHE_PATTERNS (auth, mutations).
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && /\/products(?:$|\?)/.test(url.pathname + url.search),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-catalog',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: ({ url, request }) => request.method === 'GET' && url.pathname.endsWith('/tenants/current'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-tenant',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // Unmatched requests already fall through to the network
            // untouched — this rule exists to make "never cache auth" an
            // explicit, visible decision rather than an implicit default a
            // future broader rule could accidentally paper over.
            urlPattern: ({ url }) => /\/auth\//.test(url.pathname),
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: {
        name: 'AgriDealer ERP',
        short_name: 'AgriDealer',
        description: 'Multi-tenant ERP for agricultural input dealers',
        theme_color: '#1a7a43',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
    },
    // Route chunks already split by autoCodeSplitting above; this buckets
    // the shared vendor deps those chunks pull in so a change to app code
    // doesn't bust the cache for the (much larger, rarely-changing) libs.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
            return 'react-vendor'
          }
          if (id.includes('@tanstack')) return 'tanstack'
          if (id.includes('@radix-ui')) return 'radix'
          if (id.includes('@reduxjs') || id.includes('react-redux')) return 'redux'
          if (id.includes('@sentry')) return 'sentry'
          if (id.includes('@react-pdf')) return 'pdf'
          if (id.includes('recharts')) return 'charts'
          if (id.includes('i18next')) return 'i18n'
          if (id.includes('react-hook-form') || id.includes('@hookform')) return 'forms'
          return undefined
        },
      },
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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.{ts,tsx}', 'src/routeTree.gen.ts', 'src/main.tsx', 'src/shared/testing/**'],
      // Floors, not targets — set at/just below today's actual numbers so CI
      // catches a regression without blocking on the (currently thin)
      // baseline. Raise these as real coverage work lands.
      thresholds: {
        statements: 20,
        branches: 40,
        functions: 20,
        lines: 20,
      },
    },
  },
})
