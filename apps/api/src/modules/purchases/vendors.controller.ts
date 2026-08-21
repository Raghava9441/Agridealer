import type { Request, Response } from 'express'
import { z } from 'zod'
import { createVendorSchema, updateVendorSchema, listVendorsQuerySchema } from '@agridealer/contracts'
import { VendorsService } from './vendors.service'
import { VendorRepository } from './vendor.repository'
import { sendSuccess } from '../../shared/http/respond'

const idParamSchema = z.object({ id: z.string().min(1) })

function serviceFor(req: Request): VendorsService {
  return new VendorsService(new VendorRepository({ tenantId: req.tenant.id }))
}

export const vendorsController = {
  async create(req: Request, res: Response) {
    const input = createVendorSchema.parse(req.body)
    const vendor = await serviceFor(req).create(input)

    req.auditEntity = { type: 'Vendor', id: vendor.id, after: { name: vendor.name, phone: vendor.phone } }

    sendSuccess(req, res, vendor, { status: 201 })
  },

  async list(req: Request, res: Response) {
    const query = listVendorsQuerySchema.parse(req.query)
    const vendors = await serviceFor(req).list({ search: query.search, status: query.status })

    sendSuccess(req, res, vendors)
  },

  async get(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const vendor = await serviceFor(req).get(id)

    sendSuccess(req, res, vendor)
  },

  async update(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const input = updateVendorSchema.parse(req.body)
    const { before, after } = await serviceFor(req).update(id, input)

    req.auditEntity = {
      type: 'Vendor',
      id: after.id,
      before,
      after: { name: after.name, phone: after.phone, status: after.status },
    }

    sendSuccess(req, res, after)
  },
}
