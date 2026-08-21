import type { CreateCustomerInput, UpdateCustomerInput } from '@agridealer/contracts'
import { AppError } from '../../shared/errors/AppError'
import type { CustomerRepository } from './customer.repository'
import type { ICustomer } from './customer.model'

export interface CustomerListFilter {
  status?: 'active' | 'inactive'
  search?: string
}

export interface CustomerUpdateResult {
  before: Pick<ICustomer, 'name' | 'phone' | 'status' | 'creditLimitPaise' | 'creditDays'>
  after: ICustomer
}

export class CustomersService {
  constructor(private readonly customerRepo: CustomerRepository) {}

  async create(input: CreateCustomerInput): Promise<ICustomer> {
    const existing = await this.customerRepo.findByPhone(input.phone)
    if (existing) {
      throw new AppError('VALIDATION_FAILED', { phone: 'already registered' })
    }
    return this.customerRepo.create(input)
  }

  async get(id: string): Promise<ICustomer> {
    const customer = await this.customerRepo.findById(id)
    if (!customer) {
      throw new AppError('NOT_FOUND', { id })
    }
    return customer
  }

  list(filter: CustomerListFilter = {}) {
    return this.customerRepo.list(filter)
  }

  async update(id: string, input: UpdateCustomerInput): Promise<CustomerUpdateResult> {
    const customer = await this.get(id)

    if (input.phone && input.phone !== customer.phone) {
      const existing = await this.customerRepo.findByPhone(input.phone)
      if (existing) {
        throw new AppError('VALIDATION_FAILED', { phone: 'already registered' })
      }
    }

    const before = {
      name: customer.name,
      phone: customer.phone,
      status: customer.status,
      creditLimitPaise: customer.creditLimitPaise,
      creditDays: customer.creditDays,
    }

    Object.assign(customer, input)
    await customer.save()

    return { before, after: customer }
  }
}
