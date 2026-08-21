import mongoose from 'mongoose'
import type { CreateGoodsReceiptInput } from '@agridealer/contracts'
import { AppError } from '../../shared/errors/AppError'
import { nextSequence, formatSequence } from '../../shared/sequence/sequence.service'
import type { GoodsReceiptRepository } from './goodsReceipt.repository'
import type { PurchaseOrderRepository } from './purchaseOrder.repository'
import type { VendorRepository } from './vendor.repository'
import type { ProductBatchRepository } from '../products/productBatch.repository'
import type { IProductBatch } from '../products/productBatch.model'
import type { StockMovementRepository } from '../inventory/stockMovement.repository'
import type { IGoodsReceipt } from './goodsReceipt.model'

export interface GoodsReceiptListFilter {
  vendorId?: string
  purchaseOrderId?: string
}

const OPEN_PO_STATUSES = new Set(['ordered', 'partially_received'])

/**
 * The first transactional write path in the app (docs "invoice + stock +
 * ledger", config/db.ts). Recording a GRN must, atomically: create the GRN
 * document, create-or-top-up each line's ProductBatch, write a matching
 * StockMovement('in'), and — if linked to a PurchaseOrder — advance that
 * PO's per-line receivedQuantity and overall status. A partial failure here
 * (e.g. stock written but the PO left stale) would be a real data
 * integrity bug in a financial system, hence the transaction.
 */
export class GoodsReceiptsService {
  constructor(
    private readonly tenantId: string,
    private readonly goodsReceiptRepo: GoodsReceiptRepository,
    private readonly purchaseOrderRepo: PurchaseOrderRepository,
    private readonly vendorRepo: VendorRepository,
    private readonly productBatchRepo: ProductBatchRepository,
    private readonly stockMovementRepo: StockMovementRepository,
  ) {}

  async get(id: string): Promise<IGoodsReceipt> {
    const grn = await this.goodsReceiptRepo.findById(id)
    if (!grn) {
      throw new AppError('NOT_FOUND', { id })
    }
    return grn
  }

  list(filter: GoodsReceiptListFilter = {}) {
    return this.goodsReceiptRepo.list(filter)
  }

  async receive(input: CreateGoodsReceiptInput, receivedBy: string): Promise<IGoodsReceipt> {
    const vendor = await this.vendorRepo.findById(input.vendorId)
    if (!vendor) {
      throw new AppError('NOT_FOUND', { vendorId: input.vendorId })
    }

    if (input.purchaseOrderId) {
      const po = await this.purchaseOrderRepo.findById(input.purchaseOrderId)
      if (!po) {
        throw new AppError('NOT_FOUND', { purchaseOrderId: input.purchaseOrderId })
      }
      if (!OPEN_PO_STATUSES.has(po.status)) {
        throw new AppError('VALIDATION_FAILED', { status: `purchase order is ${po.status}, not open for receiving` })
      }
    }

    const session = await mongoose.startSession()
    let grn: IGoodsReceipt | undefined

    try {
      await session.withTransaction(async () => {
        const seq = await nextSequence(this.tenantId, 'goodsReceipt', session)
        const grnNumber = formatSequence('GRN', seq)

        const grnDoc = await this.goodsReceiptRepo.create(
          {
            grnNumber,
            purchaseOrderId: input.purchaseOrderId,
            vendorId: input.vendorId,
            lines: input.lines,
            receivedBy,
          },
          session,
        )
        grn = grnDoc

        for (const line of input.lines) {
          let batch: IProductBatch | null = await this.productBatchRepo.findByProductAndBatchNumber(
            line.productId,
            line.batchNumber,
            session,
          )

          batch = batch
            ? await this.productBatchRepo.incrementQuantity(batch.id, line.quantity, session)
            : await this.productBatchRepo.create(
                {
                  productId: line.productId,
                  batchNumber: line.batchNumber,
                  mfgDate: line.mfgDate,
                  expiryDate: line.expiryDate,
                  purchasePricePaise: line.unitCostPaise,
                  mrpPaise: line.mrpPaise,
                  quantityReceived: line.quantity,
                  quantityAvailable: line.quantity,
                  vendorId: input.vendorId,
                },
                session,
              )

          await this.stockMovementRepo.record(
            {
              productId: line.productId,
              batchId: batch.id,
              direction: 'in',
              quantity: line.quantity,
              reason: 'purchase_receipt',
              unitCostPaise: line.unitCostPaise,
              referenceType: 'GoodsReceipt',
              referenceId: grnDoc.id,
              performedBy: receivedBy,
            },
            session,
          )
        }

        if (input.purchaseOrderId) {
          const receivedByProduct = new Map<string, number>()
          for (const line of input.lines) {
            receivedByProduct.set(line.productId, (receivedByProduct.get(line.productId) ?? 0) + line.quantity)
          }

          const po = await this.purchaseOrderRepo.findById(input.purchaseOrderId, session)
          if (po) {
            for (const line of po.lines) {
              const received = receivedByProduct.get(line.productId.toString())
              if (received) {
                line.receivedQuantity += received
              }
            }
            const allReceived = po.lines.every((line) => line.receivedQuantity >= line.quantity)
            const anyReceived = po.lines.some((line) => line.receivedQuantity > 0)
            po.status = allReceived ? 'received' : anyReceived ? 'partially_received' : po.status
            await po.save({ session })
          }
        }
      })
    } finally {
      await session.endSession()
    }

    // withTransaction only resolves once every operation inside it committed, so grn is always set here.
    return grn as IGoodsReceipt
  }
}
