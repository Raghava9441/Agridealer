import type { AnyKeys, ClientSession } from 'mongoose'
import type { TenantContext } from '../../shared/types/tenantContext'
import { Invoice, type IInvoice } from './invoice.model'

export class InvoiceRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  findById(id: string, session?: ClientSession) {
    return Invoice.findOne(this.scope({ _id: id })).session(session ?? null)
  }

  findByNumber(invoiceNumber: string) {
    return Invoice.findOne(this.scope({ invoiceNumber }))
  }

  list(filter: { customerId?: string; status?: IInvoice['status'] } = {}) {
    return Invoice.find(this.scope(filter)).sort({ createdAt: -1 })
  }

  listUnpaid() {
    return Invoice.find(this.scope({ paymentStatus: { $in: ['unpaid', 'partially_paid'] } })).sort({
      createdAt: 1,
    })
  }

  async create(input: AnyKeys<IInvoice>, session?: ClientSession): Promise<IInvoice> {
    const [invoice] = await Invoice.create([{ ...input, tenantId: this.ctx.tenantId }], { session })
    if (!invoice) {
      throw new Error('Invoice.create returned no document')
    }
    return invoice
  }
}
