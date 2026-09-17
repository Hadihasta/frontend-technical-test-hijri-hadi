import type {
  GoodsReceipt,
  InventoryMovement,
  InventoryStock,
  Product,
  PurchaseOrder,
  PurchaseRequest,
  Supplier,
  Warehouse,
} from '@/types'
import {
  goodsReceipts as seedGoodsReceipts,
  inventoryMovements as seedInventoryMovements,
  inventoryStocks as seedInventoryStocks,
  products as seedProducts,
  purchaseOrders as seedPurchaseOrders,
  purchaseRequests as seedPurchaseRequests,
  suppliers as seedSuppliers,
  warehouses as seedWarehouses,
} from './seed-data'

const STORAGE_KEY = 'procureflow-mock-store'

interface MockStore {
  warehouses: Warehouse[]
  suppliers: Supplier[]
  products: Product[]
  purchaseRequests: PurchaseRequest[]
  purchaseOrders: PurchaseOrder[]
  goodsReceipts: GoodsReceipt[]
  inventoryStocks: InventoryStock[]
  inventoryMovements: InventoryMovement[]
  counters: {
    pr: number
    po: number
    gr: number
  }
}

function createInitialStore(): MockStore {
  return {
    warehouses: structuredClone(seedWarehouses),
    suppliers: structuredClone(seedSuppliers),
    products: structuredClone(seedProducts),
    purchaseRequests: structuredClone(seedPurchaseRequests),
    purchaseOrders: structuredClone(seedPurchaseOrders),
    goodsReceipts: structuredClone(seedGoodsReceipts),
    inventoryStocks: structuredClone(seedInventoryStocks),
    inventoryMovements: structuredClone(seedInventoryMovements),
    counters: { pr: 5, po: 2, gr: 2 },
  }
}

let memoryStore: MockStore = loadStore()

function loadStore(): MockStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as MockStore
  } catch {
    // ignore corrupted storage
  }
  return createInitialStore()
}

function persistStore() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore))
  } catch {
    // ignore quota errors in test env
  }
}

export function getStore(): MockStore {
  return memoryStore
}

export function resetStore() {
  memoryStore = createInitialStore()
  persistStore()
}

export function updateStore(mutator: (store: MockStore) => void) {
  mutator(memoryStore)
  persistStore()
}

export function nextRequestNumber(store: MockStore): string {
  store.counters.pr += 1
  return `PR-2026-${String(store.counters.pr).padStart(5, '0')}`
}

export function nextPoNumber(store: MockStore): string {
  store.counters.po += 1
  return `PO-2026-${String(store.counters.po).padStart(5, '0')}`
}

export function nextReceiptNumber(store: MockStore): string {
  store.counters.gr += 1
  return `GR-2026-${String(store.counters.gr).padStart(6, '0')}`
}
