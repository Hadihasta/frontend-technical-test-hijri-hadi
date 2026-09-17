import { ApiError, apiRequest } from '@/api/client'
import { getStore } from '@/mock/store'

function enrichInventoryStock(stock: {
  id: string
  productId: string
  warehouseId: string
  quantity: number
}) {
  const store = getStore()
  const product = store.products.find((p) => p.id === stock.productId)
  const warehouse = store.warehouses.find((w) => w.id === stock.warehouseId)

  return {
    ...stock,
    productName: product?.name ?? 'Unknown',
    sku: product?.sku ?? '-',
    unit: product?.unit ?? '-',
    warehouseName: warehouse?.name ?? 'Unknown',
  }
}

export type EnrichedInventoryStock = ReturnType<typeof enrichInventoryStock>

export async function fetchInventory(filters?: {
  search?: string
  warehouseId?: string
}) {
  return apiRequest(() => {
    let list = getStore().inventoryStocks.map(enrichInventoryStock)

    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (item) =>
          item.productName.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.warehouseName.toLowerCase().includes(q),
      )
    }

    if (filters?.warehouseId && filters.warehouseId !== 'ALL') {
      list = list.filter((item) => item.warehouseId === filters.warehouseId)
    }

    return list.sort((a, b) => a.productName.localeCompare(b.productName))
  })
}

export async function fetchInventoryByProduct(productId: string, warehouseId: string) {
  return apiRequest(() => {
    const stock = getStore().inventoryStocks.find(
      (item) => item.productId === productId && item.warehouseId === warehouseId,
    )
    if (!stock) throw new ApiError('Inventory record not found', 404)

    const movements = getStore()
      .inventoryMovements.filter(
        (m) => m.productId === productId && m.warehouseId === warehouseId,
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return {
      ...enrichInventoryStock(stock),
      movements,
    }
  })
}

export async function fetchWarehouses() {
  return apiRequest(() => getStore().warehouses)
}

export async function fetchProducts() {
  return apiRequest(() => getStore().products)
}
