import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './app/providers'
import { initSentry } from './monitoring/sentry'
import './styles/tailwind.css'

// Must run before the app renders so nothing thrown during the very first
// paint (providers, route loaders) can slip past the sink registration in
// monitoring/logger.ts. No-ops when VITE_SENTRY_DSN isn't set.
initSentry()

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
