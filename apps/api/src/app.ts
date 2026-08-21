import express, { Router, type Request } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import mongoSanitize from 'express-mongo-sanitize'
import pinoHttp from 'pino-http'

import { isAllowedOrigin } from './config/env'
import { logger } from './config/logger'
import { requestContext } from './middleware/requestContext'
import { authenticate } from './middleware/authenticate'
import { tenantResolver } from './middleware/tenantResolver'
import { subdomainResolver } from './middleware/subdomainResolver'
import { rateLimit, authRateLimit } from './middleware/rateLimit'
import { notFoundHandler, errorHandler } from './middleware/errorHandler'

import { healthRoutes } from './modules/health/health.routes'
import { authRoutes } from './modules/auth/auth.routes'
import { tenantsRoutes } from './modules/tenants/tenants.routes'
import { usersRoutes } from './modules/users/users.routes'
import { customersRoutes } from './modules/customers/customers.routes'
import { productsRoutes } from './modules/products/products.routes'
import { vendorsRoutes } from './modules/purchases/vendors.routes'
import { purchaseOrdersRoutes } from './modules/purchases/purchaseOrders.routes'
import { goodsReceiptsRoutes } from './modules/purchases/goodsReceipts.routes'
import { invoicesRoutes } from './modules/billing/invoices.routes'
import { paymentsRoutes } from './modules/credit/payments.routes'
import { inventoryRoutes } from './modules/inventory/inventory.routes'

/**
 * Wires the middleware pipeline and route mounting described in docs §6.3.
 * Route files use relative paths only — the /api/v1 prefix is added exactly
 * once, here.
 */
export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: (origin, cb) => cb(null, isAllowedOrigin(origin)), credentials: true }))
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())
  app.use(mongoSanitize())
  app.use(compression())
  app.use(requestContext)
  // Reuse requestContext's requestId as pino-http's own request ID instead of
  // letting it generate a second, different one — otherwise a log line's ID
  // and the requestId returned to the client (meta.requestId) can diverge.
  app.use(pinoHttp({ logger, genReqId: (req) => (req as Request).requestId }))

  app.use(healthRoutes)

  app.use(subdomainResolver)

  app.use('/api/v1/tenants', tenantsRoutes)
  app.use('/api/v1/auth', authRateLimit, authRoutes)

  const apiRoutes = Router()
  apiRoutes.use('/users', usersRoutes)
  apiRoutes.use('/customers', customersRoutes)
  apiRoutes.use('/products', productsRoutes)
  apiRoutes.use('/vendors', vendorsRoutes)
  apiRoutes.use('/purchase-orders', purchaseOrdersRoutes)
  apiRoutes.use('/goods-receipts', goodsReceiptsRoutes)
  apiRoutes.use('/invoices', invoicesRoutes)
  apiRoutes.use('/payments', paymentsRoutes)
  apiRoutes.use('/inventory', inventoryRoutes)
  app.use('/api/v1', authenticate, tenantResolver, rateLimit, apiRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
