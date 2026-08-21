import type { AnyKeys, ClientSession } from 'mongoose'
import type { TenantContext } from '../../shared/types/tenantContext'
import { Payment, type IPayment } from './payment.model'

export class PaymentRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  findById(id: string) {
    return Payment.findOne(this.scope({ _id: id }))
  }

  listForParty(partyType: 'customer' | 'vendor', partyId: string) {
    return Payment.find(this.scope({ partyType, partyId })).sort({ recordedAt: -1 })
  }

  list(filter: { partyId?: string } = {}) {
    return Payment.find(this.scope(filter)).sort({ recordedAt: -1 })
  }

  async record(input: AnyKeys<IPayment>, session?: ClientSession): Promise<IPayment> {
    const [payment] = await Payment.create([{ ...input, tenantId: this.ctx.tenantId }], { session })
    if (!payment) {
      throw new Error('Payment.record returned no document')
    }
    return payment
  }
}
