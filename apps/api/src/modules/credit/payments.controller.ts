import type { Request, Response } from 'express'
import { z } from 'zod'
import { createPaymentSchema, listPaymentsQuerySchema } from '@agridealer/contracts'
import { PaymentsService } from './payments.service'
import { PaymentRepository } from './payment.repository'
import { CreditLedgerRepository } from './creditLedger.repository'
import { CustomerRepository } from '../customers/customer.repository'
import { InvoiceRepository } from '../billing/invoice.repository'
import { sendSuccess } from '../../shared/http/respond'

const idParamSchema = z.object({ id: z.string().min(1) })

function serviceFor(req: Request): PaymentsService {
  const ctx = { tenantId: req.tenant.id }
  return new PaymentsService(
    new PaymentRepository(ctx),
    new CreditLedgerRepository(ctx),
    new CustomerRepository(ctx),
    new InvoiceRepository(ctx),
  )
}

export const paymentsController = {
  async create(req: Request, res: Response) {
    const input = createPaymentSchema.parse(req.body)
    const payment = await serviceFor(req).recordCustomerPayment(input, req.user.userId)

    req.auditEntity = {
      type: 'Payment',
      id: payment.id,
      after: { customerId: payment.partyId, amountPaise: payment.amountPaise, method: payment.method },
    }

    sendSuccess(req, res, payment, { status: 201 })
  },

  async list(req: Request, res: Response) {
    const query = listPaymentsQuerySchema.parse(req.query)
    const payments = await serviceFor(req).list({ customerId: query.customerId })

    sendSuccess(req, res, payments)
  },

  async get(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const payment = await serviceFor(req).get(id)

    sendSuccess(req, res, payment)
  },
}
