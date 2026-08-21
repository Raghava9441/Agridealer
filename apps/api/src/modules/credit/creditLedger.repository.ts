import type { AnyKeys, ClientSession } from 'mongoose'
import type { TenantContext } from '../../shared/types/tenantContext'
import { CreditLedgerEntry, type ICreditLedgerEntry } from './creditLedger.model'

/** Append-only — see AuditLog/StockMovement for the same pattern. No update/delete method exists here by design. */
export class CreditLedgerRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  listForParty(partyType: 'customer' | 'vendor', partyId: string) {
    return CreditLedgerEntry.find(this.scope({ partyType, partyId })).sort({ performedAt: -1 })
  }

  latestForParty(partyType: 'customer' | 'vendor', partyId: string) {
    return CreditLedgerEntry.findOne(this.scope({ partyType, partyId })).sort({ performedAt: -1 })
  }

  async record(input: AnyKeys<ICreditLedgerEntry>, session?: ClientSession): Promise<ICreditLedgerEntry> {
    const [entry] = await CreditLedgerEntry.create([{ ...input, tenantId: this.ctx.tenantId }], { session })
    if (!entry) {
      throw new Error('CreditLedgerEntry.record returned no document')
    }
    return entry
  }
}
