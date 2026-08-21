import mongoose from 'mongoose'
import type { CreateInvoiceInput } from '@agridealer/contracts'
import { AppError } from '../../shared/errors/AppError'
import { nextSequence, formatSequence } from '../../shared/sequence/sequence.service'
import type { InvoiceRepository } from './invoice.repository'
import type { CustomerRepository } from '../customers/customer.repository'
import type { ProductRepository } from '../products/product.repository'
import type { ProductBatchRepository } from '../products/productBatch.repository'
import type { StockMovementRepository } from '../inventory/stockMovement.repository'
import type { CreditLedgerRepository } from '../credit/creditLedger.repository'
import type { IInvoice, IInvoiceLine } from './invoice.model'

export interface InvoiceListFilter {
  customerId?: string
  status?: IInvoice['status']
}

/**
 * Invoice creation + stock deduction, plus the debit half of the credit
 * ledger: a finalized invoice against a customerId immediately debits
 * Customer.currentBalancePaise and writes a CreditLedgerEntry, since that's
 * what "the customer now owes this much" means. Every invoice still starts
 * paymentStatus: 'unpaid' / amountPaidPaise: 0 — recording that it's been
 * paid (the credit half) is PaymentsService's job (modules/credit).
 *
 * Batch allocation is FEFO (first-expiry-first-out): the caller sends a
 * plain productId + quantity per line, never a batchId — this service picks
 * which batch(es) fulfill it, splitting into multiple IInvoiceLine entries
 * (same productId, different batchId) when one batch isn't enough. Splitting
 * is correct here, not a workaround: pesticide/fertilizer sales need lot
 * traceability, and the schema already supports a line array.
 */
export class InvoicesService {
  constructor(
    private readonly tenantId: string,
    private readonly invoiceRepo: InvoiceRepository,
    private readonly customerRepo: CustomerRepository,
    private readonly productRepo: ProductRepository,
    private readonly productBatchRepo: ProductBatchRepository,
    private readonly stockMovementRepo: StockMovementRepository,
    private readonly creditLedgerRepo: CreditLedgerRepository,
  ) {}

  async get(id: string): Promise<IInvoice> {
    const invoice = await this.invoiceRepo.findById(id)
    if (!invoice) {
      throw new AppError('NOT_FOUND', { id })
    }
    return invoice
  }

  list(filter: InvoiceListFilter = {}) {
    return this.invoiceRepo.list(filter)
  }

  async create(input: CreateInvoiceInput, soldBy: string): Promise<IInvoice> {
    // Snapshotted onto the invoice below, same reasoning as productName per
    // line — a bill must not change retroactively if the customer's name does.
    let customerName: string | undefined

    if (input.customerId) {
      const customer = await this.customerRepo.findById(input.customerId)
      if (!customer) {
        throw new AppError('NOT_FOUND', { customerId: input.customerId })
      }
      customerName = customer.name
    }

    const session = await mongoose.startSession()
    let invoice: IInvoice | undefined

    try {
      await session.withTransaction(async () => {
        const resolvedLines: (IInvoiceLine & { costPaise: number })[] = []

        for (const line of input.lines) {
          const product = await this.productRepo.findById(line.productId, session)
          if (!product) {
            throw new AppError('NOT_FOUND', { productId: line.productId })
          }

          const batches = await this.productBatchRepo.listAvailableForConsumption(line.productId, session)
          const allocations: { batchId: string; costPaise: number; take: number }[] = []
          let remaining = line.quantity
          for (const batch of batches) {
            if (remaining <= 0) break
            const take = Math.min(batch.quantityAvailable, remaining)
            allocations.push({ batchId: batch.id, costPaise: batch.purchasePricePaise, take })
            remaining -= take
          }
          if (remaining > 0) {
            throw new AppError('INSUFFICIENT_STOCK', {
              productId: line.productId,
              requested: line.quantity,
              available: line.quantity - remaining,
            })
          }

          let discountAllocated = 0
          for (let i = 0; i < allocations.length; i++) {
            const allocation = allocations[i]!
            const consumed = await this.productBatchRepo.tryConsume(allocation.batchId, allocation.take, session)
            if (!consumed) {
              throw new AppError('INSUFFICIENT_STOCK', { productId: line.productId, batchId: allocation.batchId })
            }

            const isLast = i === allocations.length - 1
            const subDiscount = isLast
              ? line.discountPaise - discountAllocated
              : Math.floor((line.discountPaise * allocation.take) / line.quantity)
            discountAllocated += subDiscount

            const beforeTax = line.unitPricePaise * allocation.take - subDiscount
            const taxAmount = Math.round((beforeTax * product.gstRatePercent) / 100)

            resolvedLines.push({
              productId: product._id,
              batchId: consumed._id,
              productName: product.name,
              quantity: allocation.take,
              unitPricePaise: line.unitPricePaise,
              discountPaise: subDiscount,
              taxRatePercent: product.gstRatePercent,
              taxAmountPaise: taxAmount,
              lineTotalPaise: beforeTax + taxAmount,
              costPaise: allocation.costPaise,
            } as IInvoiceLine & { costPaise: number })
          }
        }

        const subtotalPaise = resolvedLines.reduce((sum, l) => sum + l.unitPricePaise * l.quantity, 0)
        const discountTotalPaise = resolvedLines.reduce((sum, l) => sum + l.discountPaise, 0)
        const taxTotalPaise = resolvedLines.reduce((sum, l) => sum + l.taxAmountPaise, 0)
        const grandTotalPaise = subtotalPaise - discountTotalPaise + taxTotalPaise

        const seq = await nextSequence(this.tenantId, 'invoice', session)
        const invoiceNumber = formatSequence('INV', seq)

        const created = await this.invoiceRepo.create(
          {
            invoiceNumber,
            customerId: input.customerId,
            customerName,
            lines: resolvedLines,
            subtotalPaise,
            discountTotalPaise,
            taxTotalPaise,
            grandTotalPaise,
            amountPaidPaise: 0,
            paymentStatus: 'unpaid',
            status: 'finalized',
            soldBy,
          },
          session,
        )
        invoice = created

        for (const line of resolvedLines) {
          await this.stockMovementRepo.record(
            {
              productId: line.productId,
              batchId: line.batchId,
              direction: 'out',
              quantity: line.quantity,
              reason: 'sale',
              unitCostPaise: line.costPaise,
              referenceType: 'Invoice',
              referenceId: created.id,
              performedBy: soldBy,
            },
            session,
          )
        }

        if (input.customerId) {
          const updatedCustomer = await this.customerRepo.incrementBalance(input.customerId, grandTotalPaise, session)
          await this.creditLedgerRepo.record(
            {
              partyType: 'customer',
              partyModel: 'Customer',
              partyId: input.customerId,
              entryType: 'invoice',
              referenceType: 'Invoice',
              referenceId: created.id,
              debitPaise: grandTotalPaise,
              creditPaise: 0,
              balanceAfterPaise: updatedCustomer.currentBalancePaise,
            },
            session,
          )
        }
      })
    } finally {
      await session.endSession()
    }

    // withTransaction only resolves once every operation inside it committed, so invoice is always set here.
    return invoice as IInvoice
  }
}
