import mongoose from 'mongoose'
import type { CreatePaymentInput } from '@agridealer/contracts'
import { AppError } from '../../shared/errors/AppError'
import type { PaymentRepository } from './payment.repository'
import type { CreditLedgerRepository } from './creditLedger.repository'
import type { CustomerRepository } from '../customers/customer.repository'
import type { InvoiceRepository } from '../billing/invoice.repository'
import type { IPayment } from './payment.model'

/**
 * The credit half of the ledger — see invoices.service.ts for the debit
 * half (an invoice against a customer debits them immediately on finalize).
 * Only customer receipts (direction: 'in') are supported so far; there's no
 * VendorBill yet for a vendor payment (direction: 'out') to apply against.
 */
export class PaymentsService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly creditLedgerRepo: CreditLedgerRepository,
    private readonly customerRepo: CustomerRepository,
    private readonly invoiceRepo: InvoiceRepository,
  ) {}

  async get(id: string): Promise<IPayment> {
    const payment = await this.paymentRepo.findById(id)
    if (!payment) {
      throw new AppError('NOT_FOUND', { id })
    }
    return payment
  }

  list(filter: { customerId?: string } = {}) {
    return this.paymentRepo.list({ partyId: filter.customerId })
  }

  async recordCustomerPayment(input: CreatePaymentInput, recordedBy: string): Promise<IPayment> {
    const customer = await this.customerRepo.findById(input.customerId)
    if (!customer) {
      throw new AppError('NOT_FOUND', { customerId: input.customerId })
    }

    const appliedSum = input.appliedTo.reduce((sum, a) => sum + a.amountPaise, 0)
    if (appliedSum > input.amountPaise) {
      throw new AppError('VALIDATION_FAILED', { appliedTo: 'sum of allocations exceeds the payment amount' })
    }

    const session = await mongoose.startSession()
    let payment: IPayment | undefined

    try {
      await session.withTransaction(async () => {
        for (const allocation of input.appliedTo) {
          const invoice = await this.invoiceRepo.findById(allocation.invoiceId, session)
          if (!invoice) {
            throw new AppError('NOT_FOUND', { invoiceId: allocation.invoiceId })
          }
          if (invoice.customerId?.toString() !== input.customerId) {
            throw new AppError('VALIDATION_FAILED', { invoiceId: 'does not belong to this customer' })
          }

          const remaining = invoice.grandTotalPaise - invoice.amountPaidPaise
          if (allocation.amountPaise > remaining) {
            throw new AppError('VALIDATION_FAILED', {
              invoiceId: allocation.invoiceId,
              remaining,
              attempted: allocation.amountPaise,
            })
          }

          invoice.amountPaidPaise += allocation.amountPaise
          invoice.paymentStatus =
            invoice.amountPaidPaise >= invoice.grandTotalPaise
              ? 'paid'
              : invoice.amountPaidPaise > 0
                ? 'partially_paid'
                : 'unpaid'
          await invoice.save({ session })
        }

        const created = await this.paymentRepo.record(
          {
            direction: 'in',
            partyType: 'customer',
            partyModel: 'Customer',
            partyId: input.customerId,
            amountPaise: input.amountPaise,
            method: input.method,
            referenceNumber: input.referenceNumber,
            appliedTo: input.appliedTo.map((a) => ({
              documentType: 'Invoice' as const,
              documentId: a.invoiceId,
              amountPaise: a.amountPaise,
            })),
            recordedBy,
          },
          session,
        )
        payment = created

        const updatedCustomer = await this.customerRepo.incrementBalance(
          input.customerId,
          -input.amountPaise,
          session,
        )

        await this.creditLedgerRepo.record(
          {
            partyType: 'customer',
            partyModel: 'Customer',
            partyId: input.customerId,
            entryType: 'payment',
            referenceType: 'Payment',
            referenceId: created.id,
            debitPaise: 0,
            creditPaise: input.amountPaise,
            balanceAfterPaise: updatedCustomer.currentBalancePaise,
          },
          session,
        )
      })
    } finally {
      await session.endSession()
    }

    // withTransaction only resolves once every operation inside it committed, so payment is always set here.
    return payment as IPayment
  }
}
