import type { CreatePurchaseOrderInput } from '@agridealer/contracts'
import { AppError } from '../../shared/errors/AppError'
import { nextSequence, formatSequence } from '../../shared/sequence/sequence.service'
import type { PurchaseOrderRepository } from './purchaseOrder.repository'
import type { VendorRepository } from './vendor.repository'
import type { IPurchaseOrder } from './purchaseOrder.model'

export interface PurchaseOrderListFilter {
  status?: IPurchaseOrder['status']
  vendorId?: string
}

export class PurchaseOrdersService {
  constructor(
    private readonly tenantId: string,
    private readonly purchaseOrderRepo: PurchaseOrderRepository,
    private readonly vendorRepo: VendorRepository,
  ) {}

  async create(input: CreatePurchaseOrderInput, createdBy: string): Promise<IPurchaseOrder> {
    const vendor = await this.vendorRepo.findById(input.vendorId)
    if (!vendor) {
      throw new AppError('NOT_FOUND', { vendorId: input.vendorId })
    }

    const seq = await nextSequence(this.tenantId, 'purchaseOrder')
    const poNumber = formatSequence('PO', seq)

    return this.purchaseOrderRepo.create({
      poNumber,
      vendorId: input.vendorId,
      lines: input.lines.map((line) => ({ ...line, receivedQuantity: 0 })),
      expectedDate: input.expectedDate,
      status: 'ordered',
      createdBy,
    })
  }

  async get(id: string): Promise<IPurchaseOrder> {
    const po = await this.purchaseOrderRepo.findById(id)
    if (!po) {
      throw new AppError('NOT_FOUND', { id })
    }
    return po
  }

  list(filter: PurchaseOrderListFilter = {}) {
    return this.purchaseOrderRepo.list(filter)
  }

  async cancel(id: string): Promise<IPurchaseOrder> {
    const po = await this.get(id)
    if (po.status === 'received' || po.status === 'cancelled') {
      throw new AppError('VALIDATION_FAILED', { status: `cannot cancel a purchase order that is already ${po.status}` })
    }
    po.status = 'cancelled'
    await po.save()
    return po
  }
}
