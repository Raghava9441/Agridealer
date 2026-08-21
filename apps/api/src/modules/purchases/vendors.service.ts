import type { CreateVendorInput, UpdateVendorInput } from '@agridealer/contracts'
import { AppError } from '../../shared/errors/AppError'
import type { VendorRepository } from './vendor.repository'
import type { IVendor } from './vendor.model'

export interface VendorListFilter {
  status?: 'active' | 'inactive'
  search?: string
}

export interface VendorUpdateResult {
  before: Pick<IVendor, 'name' | 'phone' | 'status'>
  after: IVendor
}

export class VendorsService {
  constructor(private readonly vendorRepo: VendorRepository) {}

  async create(input: CreateVendorInput): Promise<IVendor> {
    const existing = await this.vendorRepo.findByPhone(input.phone)
    if (existing) {
      throw new AppError('VALIDATION_FAILED', { phone: 'already registered' })
    }
    return this.vendorRepo.create(input)
  }

  async get(id: string): Promise<IVendor> {
    const vendor = await this.vendorRepo.findById(id)
    if (!vendor) {
      throw new AppError('NOT_FOUND', { id })
    }
    return vendor
  }

  list(filter: VendorListFilter = {}) {
    return this.vendorRepo.list(filter)
  }

  async update(id: string, input: UpdateVendorInput): Promise<VendorUpdateResult> {
    const vendor = await this.get(id)

    if (input.phone && input.phone !== vendor.phone) {
      const existing = await this.vendorRepo.findByPhone(input.phone)
      if (existing) {
        throw new AppError('VALIDATION_FAILED', { phone: 'already registered' })
      }
    }

    const before = { name: vendor.name, phone: vendor.phone, status: vendor.status }

    Object.assign(vendor, input)
    await vendor.save()

    return { before, after: vendor }
  }
}
