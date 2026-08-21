import { Router } from 'express'
import { inventoryController } from './inventory.controller'
import { asyncHandler } from '../../shared/utils/asyncHandler'

export const inventoryRoutes = Router()

// All reads — no dedicated inventory:view permission, same pattern as every
// other module's GET routes (every role needs to see stock).
inventoryRoutes.get('/expiring', asyncHandler(inventoryController.expiring))
inventoryRoutes.get('/stock/:productId', asyncHandler(inventoryController.stockSummary))
inventoryRoutes.get('/batches/:productId', asyncHandler(inventoryController.batches))
inventoryRoutes.get('/movements/:productId', asyncHandler(inventoryController.movements))
