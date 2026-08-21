import type { Request, Response } from 'express'
import { z } from 'zod'
import { createInvoiceSchema, listInvoicesQuerySchema } from '@agridealer/contracts'
import { InvoicesService } from './invoices.service'
import { InvoiceRepository } from './invoice.repository'
import { CustomerRepository } from '../customers/customer.repository'
import { ProductRepository } from '../products/product.repository'
import { ProductBatchRepository } from '../products/productBatch.repository'
import { StockMovementRepository } from '../inventory/stockMovement.repository'
import { CreditLedgerRepository } from '../credit/creditLedger.repository'
import { sendSuccess } from '../../shared/http/respond'

const idParamSchema = z.object({ id: z.string().min(1) })

function serviceFor(req: Request): InvoicesService {
  const ctx = { tenantId: req.tenant.id }
  return new InvoicesService(
    req.tenant.id,
    new InvoiceRepository(ctx),
    new CustomerRepository(ctx),
    new ProductRepository(ctx),
    new ProductBatchRepository(ctx),
    new StockMovementRepository(ctx),
    new CreditLedgerRepository(ctx),
  )
}

export const invoicesController = {
  async create(req: Request, res: Response) {
    const input = createInvoiceSchema.parse(req.body)
    const invoice = await serviceFor(req).create(input, req.user.userId)

    req.auditEntity = {
      type: 'Invoice',
      id: invoice.id,
      after: { invoiceNumber: invoice.invoiceNumber, grandTotalPaise: invoice.grandTotalPaise },
    }

    sendSuccess(req, res, invoice, { status: 201 })
  },

  async list(req: Request, res: Response) {
    const query = listInvoicesQuerySchema.parse(req.query)
    const invoices = await serviceFor(req).list({ customerId: query.customerId, status: query.status })

    sendSuccess(req, res, invoices)
  },

  async get(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const invoice = await serviceFor(req).get(id)

    sendSuccess(req, res, invoice)
  },
}
