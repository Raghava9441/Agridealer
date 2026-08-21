import type { CreateProductInput, UpdateProductInput } from '@agridealer/contracts'
import { AppError } from '../../shared/errors/AppError'
import type { ProductRepository } from './product.repository'
import type { IProduct } from './product.model'

export interface ProductListFilter {
  status?: 'active' | 'discontinued'
  category?: string
  search?: string
}

export interface ProductUpdateResult {
  before: Pick<IProduct, 'name' | 'sku' | 'gstRatePercent' | 'status'>
  after: IProduct
}

export class ProductsService {
  constructor(private readonly productRepo: ProductRepository) {}

  async create(input: CreateProductInput): Promise<IProduct> {
    const existing = await this.productRepo.findBySku(input.sku)
    if (existing) {
      throw new AppError('VALIDATION_FAILED', { sku: 'already in use' })
    }
    return this.productRepo.create(input)
  }

  async get(id: string): Promise<IProduct> {
    const product = await this.productRepo.findById(id)
    if (!product) {
      throw new AppError('NOT_FOUND', { id })
    }
    return product
  }

  list(filter: ProductListFilter = {}) {
    return this.productRepo.list(filter)
  }

  async update(id: string, input: UpdateProductInput): Promise<ProductUpdateResult> {
    const product = await this.get(id)

    if (input.sku && input.sku !== product.sku) {
      const existing = await this.productRepo.findBySku(input.sku)
      if (existing) {
        throw new AppError('VALIDATION_FAILED', { sku: 'already in use' })
      }
    }

    const before = {
      name: product.name,
      sku: product.sku,
      gstRatePercent: product.gstRatePercent,
      status: product.status,
    }

    Object.assign(product, input)
    await product.save()

    return { before, after: product }
  }
}
