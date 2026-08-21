import type { Request, Response } from 'express'
import { z } from 'zod'
import { createCustomerSchema, updateCustomerSchema, listCustomersQuerySchema } from '@agridealer/contracts'
import { CustomersService } from './customers.service'
import { CustomerRepository } from './customer.repository'
import { sendSuccess } from '../../shared/http/respond'

const idParamSchema = z.object({ id: z.string().min(1) })

function serviceFor(req: Request): CustomersService {
  return new CustomersService(new CustomerRepository({ tenantId: req.tenant.id }))
}

export const customersController = {
  async create(req: Request, res: Response) {
    const input = createCustomerSchema.parse(req.body)
    const customer = await serviceFor(req).create(input)

    req.auditEntity = { type: 'Customer', id: customer.id, after: { name: customer.name, phone: customer.phone } }

    sendSuccess(req, res, customer, { status: 201 })
  },

  async list(req: Request, res: Response) {
    const query = listCustomersQuerySchema.parse(req.query)
    const customers = await serviceFor(req).list({ search: query.search, status: query.status })

    sendSuccess(req, res, customers)
  },

  async get(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const customer = await serviceFor(req).get(id)

    sendSuccess(req, res, customer)
  },

  async update(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const input = updateCustomerSchema.parse(req.body)
    const { before, after } = await serviceFor(req).update(id, input)

    req.auditEntity = {
      type: 'Customer',
      id: after.id,
      before,
      after: { name: after.name, phone: after.phone, status: after.status },
    }

    sendSuccess(req, res, after)
  },
}
