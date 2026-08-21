import argon2 from 'argon2'
import { env } from '../config/env'
import { connectDatabase, disconnectDatabase } from '../config/db'
import { connectRedis, disconnectRedis } from '../config/redis'
import { Tenant, type ITenant } from '../modules/tenants/tenants.model'
import { User } from '../modules/users/users.model'
import { UserRepository } from '../modules/users/users.repository'
import { UsersService } from '../modules/users/users.service'
import { CustomerRepository } from '../modules/customers/customer.repository'
import { CustomersService } from '../modules/customers/customers.service'
import { VendorRepository } from '../modules/purchases/vendor.repository'
import { VendorsService } from '../modules/purchases/vendors.service'
import { ProductRepository } from '../modules/products/product.repository'
import { ProductsService } from '../modules/products/products.service'
import { ProductBatchRepository } from '../modules/products/productBatch.repository'
import { PurchaseOrderRepository } from '../modules/purchases/purchaseOrder.repository'
import { PurchaseOrdersService } from '../modules/purchases/purchaseOrders.service'
import { GoodsReceiptRepository } from '../modules/purchases/goodsReceipt.repository'
import { GoodsReceiptsService } from '../modules/purchases/goodsReceipts.service'
import { StockMovementRepository } from '../modules/inventory/stockMovement.repository'
import { InvoiceRepository } from '../modules/billing/invoice.repository'
import { Invoice, type IInvoice } from '../modules/billing/invoice.model'
import { InvoicesService } from '../modules/billing/invoices.service'
import { CreditLedgerRepository } from '../modules/credit/creditLedger.repository'
import { PaymentRepository } from '../modules/credit/payment.repository'
import { PaymentsService } from '../modules/credit/payments.service'
import { isAppError } from '../shared/errors/AppError'

/**
 * Dev-only demo data: two tenants, each with a full staff roster, vendors,
 * a product catalogue with real received stock (via the actual PO -> GRN
 * flow, not a shortcut), customers, and a mix of paid/partial/unpaid
 * invoices — enough to click through every built screen with realistic
 * numbers instead of empty states.
 */
if (env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.error('Refusing to run the demo-data seed against a production environment.')
  process.exit(1)
}

const TENANTS = [
  { name: 'Demo Dealer A', slug: 'demo-a' },
  { name: 'Demo Dealer B', slug: 'demo-b' },
]
const SHARED_EMAIL = 'owner@demo.test'

const STAFF = [
  { role: 'manager' as const, email: 'manager@demo.test', name: 'Store Manager' },
  { role: 'sales' as const, email: 'sales@demo.test', name: 'Sales Executive' },
  { role: 'accountant' as const, email: 'accountant@demo.test', name: 'Accountant' },
  { role: 'warehouse' as const, email: 'warehouse@demo.test', name: 'Warehouse Staff' },
]

const VENDORS = [
  { name: 'Krishna Agro Distributors', phone: '9000000001', gstin: '36AAACK1234F1Z5' },
  { name: 'Godavari Fertilizers Pvt Ltd', phone: '9000000002', gstin: '36AAACG5678F1Z2' },
  { name: 'Sri Balaji Pesticides', phone: '9000000003', gstin: '36AAACB9012F1Z8' },
]

interface ProductSeed {
  sku: string
  name: string
  category: string
  unit: 'kg' | 'litre' | 'bag' | 'piece' | 'box'
  hsnCode: string
  gstRatePercent: number
  reorderLevel: number
  purchasePricePaise: number
  mrpPaise: number
  receiveQuantity: number
  vendorIdx: number
  shelfLifeDays: number
}

const PRODUCTS: ProductSeed[] = [
  { sku: 'UREA-50KG', name: 'Urea 46% N (50kg bag)', category: 'Fertilizers', unit: 'bag', hsnCode: '31021000', gstRatePercent: 5, reorderLevel: 20, purchasePricePaise: 26650, mrpPaise: 30000, receiveQuantity: 100, vendorIdx: 1, shelfLifeDays: 730 },
  { sku: 'DAP-50KG', name: 'DAP 18:46:0 (50kg bag)', category: 'Fertilizers', unit: 'bag', hsnCode: '31031000', gstRatePercent: 5, reorderLevel: 15, purchasePricePaise: 130000, mrpPaise: 145000, receiveQuantity: 60, vendorIdx: 1, shelfLifeDays: 730 },
  { sku: 'NPK-19-19-19', name: 'NPK 19:19:19 Complex (50kg bag)', category: 'Fertilizers', unit: 'bag', hsnCode: '31051000', gstRatePercent: 5, reorderLevel: 15, purchasePricePaise: 110000, mrpPaise: 125000, receiveQuantity: 60, vendorIdx: 1, shelfLifeDays: 730 },
  { sku: 'HYBRID-MAIZE-1KG', name: 'Hybrid Maize Seed (1kg pack)', category: 'Seeds', unit: 'kg', hsnCode: '10059000', gstRatePercent: 0, reorderLevel: 25, purchasePricePaise: 38000, mrpPaise: 45000, receiveQuantity: 100, vendorIdx: 0, shelfLifeDays: 365 },
  { sku: 'BT-COTTON-450G', name: 'Bt Cotton Seed (450g packet)', category: 'Seeds', unit: 'piece', hsnCode: '12072990', gstRatePercent: 0, reorderLevel: 40, purchasePricePaise: 72000, mrpPaise: 81000, receiveQuantity: 200, vendorIdx: 0, shelfLifeDays: 365 },
  { sku: 'IMID-100ML', name: 'Imidacloprid 17.8% SL (100ml)', category: 'Pesticides', unit: 'piece', hsnCode: '38089199', gstRatePercent: 18, reorderLevel: 30, purchasePricePaise: 18000, mrpPaise: 22000, receiveQuantity: 150, vendorIdx: 2, shelfLifeDays: 730 },
  { sku: 'GLYPH-1L', name: 'Glyphosate 41% SL (1L)', category: 'Herbicides', unit: 'litre', hsnCode: '38089340', gstRatePercent: 18, reorderLevel: 20, purchasePricePaise: 34000, mrpPaise: 41000, receiveQuantity: 100, vendorIdx: 2, shelfLifeDays: 730 },
  { sku: 'MANCOZEB-1KG', name: 'Mancozeb 75% WP (1kg)', category: 'Fungicides', unit: 'kg', hsnCode: '38089298', gstRatePercent: 18, reorderLevel: 25, purchasePricePaise: 26000, mrpPaise: 31000, receiveQuantity: 120, vendorIdx: 2, shelfLifeDays: 545 },
]

const CUSTOMERS = [
  { name: 'Ramesh Kumar', phone: '9111111111', creditLimitPaise: 5_000_00, creditDays: 30 },
  { name: 'Lakshmi Agro Traders', phone: '9111111112', gstin: '36AABCL4321F1Z3', creditLimitPaise: 20_000_00, creditDays: 45 },
  { name: 'Venkata Rao', phone: '9111111113', creditLimitPaise: 3_000_00, creditDays: 15 },
  { name: 'Suresh Reddy', phone: '9111111114', creditLimitPaise: 7_500_00, creditDays: 30 },
  { name: 'Padma Devi', phone: '9111111115', creditLimitPaise: 2_000_00, creditDays: 15 },
  { name: 'Sai Fertilizer Retail', phone: '9111111116', gstin: '36AABCS8765F1Z9', creditLimitPaise: 30_000_00, creditDays: 60 },
]

/** Invoice specs: which customer (or none, for a walk-in sale) buys which products in what quantity. */
const INVOICE_SPECS: { customerIdx: number | null; lines: { sku: string; qty: number }[]; payment: 'full' | 'partial' | 'none'; backdateDays?: number }[] = [
  { customerIdx: 0, lines: [{ sku: 'UREA-50KG', qty: 4 }, { sku: 'DAP-50KG', qty: 2 }], payment: 'full' },
  { customerIdx: 1, lines: [{ sku: 'NPK-19-19-19', qty: 6 }, { sku: 'IMID-100ML', qty: 10 }], payment: 'full' },
  { customerIdx: 2, lines: [{ sku: 'HYBRID-MAIZE-1KG', qty: 5 }], payment: 'partial' },
  { customerIdx: 3, lines: [{ sku: 'BT-COTTON-450G', qty: 8 }, { sku: 'GLYPH-1L', qty: 3 }], payment: 'partial' },
  { customerIdx: 4, lines: [{ sku: 'MANCOZEB-1KG', qty: 6 }], payment: 'none' },
  { customerIdx: 5, lines: [{ sku: 'UREA-50KG', qty: 10 }, { sku: 'NPK-19-19-19', qty: 8 }], payment: 'none', backdateDays: 50 },
  { customerIdx: 0, lines: [{ sku: 'GLYPH-1L', qty: 2 }], payment: 'none', backdateDays: 40 },
  { customerIdx: null, lines: [{ sku: 'IMID-100ML', qty: 2 }], payment: 'none' },
  { customerIdx: null, lines: [{ sku: 'DAP-50KG', qty: 1 }], payment: 'none' },
  { customerIdx: 1, lines: [{ sku: 'MANCOZEB-1KG', qty: 4 }, { sku: 'BT-COTTON-450G', qty: 5 }], payment: 'full' },
]

async function getOrCreate<T>(create: () => Promise<T>, lookup: () => Promise<T | null>): Promise<T> {
  try {
    return await create()
  } catch (err) {
    if (isAppError(err) && err.code === 'VALIDATION_FAILED') {
      const existing = await lookup()
      if (existing) return existing
    }
    throw err
  }
}

async function seedTenantData(tenant: ITenant, ownerId: string) {
  const ctx = { tenantId: tenant.id }
  const slug = tenant.slug

  // --- Staff (one of each role, alongside the already-seeded owner) ---
  const usersService = new UsersService(new UserRepository(ctx))
  const userRepo = new UserRepository(ctx)
  const staffPassword = `${slug}-pass123`
  const staffIds = { owner: ownerId } as Record<'owner' | 'manager' | 'sales' | 'accountant' | 'warehouse', string>
  for (const s of STAFF) {
    const user = await getOrCreate(
      () => usersService.createStaff({ name: s.name, email: s.email, password: staffPassword, role: s.role }),
      () => userRepo.findByEmail(s.email),
    )
    staffIds[s.role] = user.id
  }

  // --- Vendors ---
  const vendorsService = new VendorsService(new VendorRepository(ctx))
  const vendorRepo = new VendorRepository(ctx)
  const vendors = []
  for (const v of VENDORS) {
    vendors.push(
      await getOrCreate(
        () => vendorsService.create({ name: v.name, phone: v.phone, gstin: v.gstin }),
        () => vendorRepo.findByPhone(v.phone),
      ),
    )
  }

  // --- Products ---
  const productsService = new ProductsService(new ProductRepository(ctx))
  const productRepo = new ProductRepository(ctx)
  const products: Record<string, { id: string; mrpPaise: number }> = {}
  for (const p of PRODUCTS) {
    const doc = await getOrCreate(
      () =>
        productsService.create({
          sku: p.sku,
          name: p.name,
          category: p.category,
          unit: p.unit,
          hsnCode: p.hsnCode,
          gstRatePercent: p.gstRatePercent,
          batchTracked: true,
          reorderLevel: p.reorderLevel,
        }),
      () => productRepo.findBySku(p.sku),
    )
    products[p.sku] = { id: doc.id, mrpPaise: p.mrpPaise }
  }

  // --- Purchase orders + goods receipts (real stock, via the actual service flow) ---
  const poService = new PurchaseOrdersService(tenant.id, new PurchaseOrderRepository(ctx), new VendorRepository(ctx))
  const grnService = new GoodsReceiptsService(
    tenant.id,
    new GoodsReceiptRepository(ctx),
    new PurchaseOrderRepository(ctx),
    new VendorRepository(ctx),
    new ProductBatchRepository(ctx),
    new StockMovementRepository(ctx),
  )

  const now = Date.now()
  for (const p of PRODUCTS) {
    const vendor = vendors[p.vendorIdx]!
    const productId = products[p.sku]!.id

    const po = await poService.create(
      { vendorId: vendor.id, lines: [{ productId, quantity: p.receiveQuantity, unitCostPaise: p.purchasePricePaise }] },
      staffIds.owner,
    )

    await grnService.receive(
      {
        vendorId: vendor.id,
        purchaseOrderId: po.id,
        lines: [
          {
            productId,
            batchNumber: `B-${p.sku}-01`,
            mfgDate: new Date(now - 30 * 86_400_000),
            expiryDate: new Date(now + p.shelfLifeDays * 86_400_000),
            quantity: p.receiveQuantity,
            unitCostPaise: p.purchasePricePaise,
            mrpPaise: p.mrpPaise,
          },
        ],
      },
      staffIds.warehouse,
    )
  }

  // --- Customers ---
  const customersService = new CustomersService(new CustomerRepository(ctx))
  const customerRepo = new CustomerRepository(ctx)
  const customers = []
  for (const c of CUSTOMERS) {
    customers.push(
      await getOrCreate(
        () =>
          customersService.create({
            name: c.name,
            phone: c.phone,
            gstin: c.gstin,
            creditLimitPaise: c.creditLimitPaise,
            creditDays: c.creditDays,
          }),
        () => customerRepo.findByPhone(c.phone),
      ),
    )
  }

  // --- Invoices (consumes real stock via FEFO) + payments ---
  const invoicesService = new InvoicesService(
    tenant.id,
    new InvoiceRepository(ctx),
    new CustomerRepository(ctx),
    new ProductRepository(ctx),
    new ProductBatchRepository(ctx),
    new StockMovementRepository(ctx),
    new CreditLedgerRepository(ctx),
  )
  const paymentsService = new PaymentsService(
    new PaymentRepository(ctx),
    new CreditLedgerRepository(ctx),
    new CustomerRepository(ctx),
    new InvoiceRepository(ctx),
  )

  for (const spec of INVOICE_SPECS) {
    const customer = spec.customerIdx === null ? null : customers[spec.customerIdx]
    let invoice: IInvoice
    try {
      invoice = await invoicesService.create(
        {
          customerId: customer?.id,
          lines: spec.lines.map((l) => ({
            productId: products[l.sku]!.id,
            quantity: l.qty,
            unitPricePaise: products[l.sku]!.mrpPaise,
            discountPaise: 0,
          })),
        },
        staffIds.sales,
      )
    } catch (err) {
      if (isAppError(err) && err.code === 'INSUFFICIENT_STOCK') {
        // eslint-disable-next-line no-console
        console.warn(`  skipped an invoice for ${slug} — insufficient stock (safe to ignore on re-run)`)
        continue
      }
      throw err
    }

    if (spec.backdateDays) {
      // Simulates an overdue invoice — InvoicesService.create doesn't accept
      // a createdAt override, so backdate it directly for demo purposes.
      await Invoice.updateOne({ _id: invoice.id }, { $set: { createdAt: new Date(now - spec.backdateDays * 86_400_000) } })
    }

    if (spec.payment === 'none' || !customer) continue

    const amount = spec.payment === 'full' ? invoice.grandTotalPaise : Math.round(invoice.grandTotalPaise * 0.4)
    await paymentsService.recordCustomerPayment(
      {
        customerId: customer.id,
        amountPaise: amount,
        method: 'cash',
        appliedTo: [{ invoiceId: invoice.id, amountPaise: amount }],
      },
      staffIds.accountant,
    )
  }

  // eslint-disable-next-line no-console
  console.log(`  seeded ${vendors.length} vendors, ${PRODUCTS.length} products (stocked), ${customers.length} customers, ~${INVOICE_SPECS.length} invoices`)
}

async function main() {
  await connectDatabase()
  await connectRedis()

  for (const t of TENANTS) {
    const tenant = await Tenant.findOneAndUpdate(
      { slug: t.slug },
      { $setOnInsert: { name: t.name, slug: t.slug, status: 'active', plan: 'starter', features: [], timezone: 'Asia/Kolkata' } },
      { upsert: true, new: true },
    )

    const password = `${t.slug}-pass123`
    const passwordHash = await argon2.hash(password)

    const owner = await User.findOneAndUpdate(
      { tenantId: tenant.id, email: SHARED_EMAIL },
      {
        $setOnInsert: {
          tenantId: tenant.id,
          name: `${t.name} Owner`,
          email: SHARED_EMAIL,
          passwordHash,
          role: 'owner',
          status: 'active',
        },
      },
      { upsert: true, new: true },
    )

    // eslint-disable-next-line no-console
    console.log(`${t.slug}: http://${t.slug}.localhost:5173  email=${SHARED_EMAIL}  password=${password}  (staff: manager@demo.test / sales@demo.test / accountant@demo.test / warehouse@demo.test, same password)`)

    await seedTenantData(tenant, owner.id)
  }

  await disconnectRedis()
  await disconnectDatabase()
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', err)
    process.exit(1)
  })
