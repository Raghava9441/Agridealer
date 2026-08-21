import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartLine {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountAmount: number
}

export interface Discount {
  type: 'flat' | 'percent'
  value: number
}

interface CartState {
  lines: CartLine[]
  customerId: string | null
  /** Kept alongside customerId so the picked customer's name survives a reload without a fetch-by-id. */
  customerName: string | null
  discount: Discount | null
  addLine: (line: CartLine) => void
  updateQty: (lineId: string, qty: number) => void
  updateLine: (lineId: string, patch: Partial<Pick<CartLine, 'unitPrice' | 'discountAmount' | 'quantity'>>) => void
  removeLine: (lineId: string) => void
  setCustomer: (customerId: string | null, customerName?: string | null) => void
  clear: () => void
}

/**
 * The in-progress POS cart is true client state — it never exists on the
 * server until the bill is saved (docs §5.4). Persisted to localStorage so
 * an accidental refresh mid-bill does not lose a counter transaction.
 * "Hold bill" (moving a draft aside) is a Phase 2 feature layered on top of
 * this store once the billing module exists.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      customerId: null,
      customerName: null,
      discount: null,

      addLine: (line) => set((s) => ({ lines: [...s.lines, line] })),

      updateQty: (lineId, qty) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.id === lineId ? { ...l, quantity: qty } : l)),
        })),

      // POS needs to edit the price/discount the operator entered before finalizing, not just quantity — updateQty
      // predates the POS screen actually existing, so this fills the gap rather than replacing it (kept for compat).
      updateLine: (lineId, patch) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l)),
        })),

      removeLine: (lineId) => set((s) => ({ lines: s.lines.filter((l) => l.id !== lineId) })),

      setCustomer: (customerId, customerName = null) => set({ customerId, customerName }),

      clear: () => set({ lines: [], customerId: null, customerName: null, discount: null }),
    }),
    { name: 'agridealer-pos-draft' },
  ),
)
