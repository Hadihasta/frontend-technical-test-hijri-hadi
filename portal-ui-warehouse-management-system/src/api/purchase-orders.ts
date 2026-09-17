import { ApiError, apiRequest } from '@/api/client'
import { getStore, nextReceiptNumber, updateStore } from '@/mock/store'
import type { GoodsReceiptInput, PurchaseOrder, PurchaseOrderStatus } from '@/types'

function derivePoStatus(items: PurchaseOrder['items']): PurchaseOrderStatus {
  const totalOrdered = items.reduce((sum, i) => sum + i.orderedQuantity, 0)
  const totalReceived = items.reduce((sum, i) => sum + i.receivedQuantity, 0)

  if (totalReceived === 0) return 'ORDERED'
  if (totalReceived >= totalOrdered) return 'RECEIVED'
  return 'PARTIALLY_RECEIVED'
}

function enrichPurchaseOrder(po: PurchaseOrder) {
  const store = getStore()
  const warehouse = store.warehouses.find((w) => w.id === po.warehouseId)
  const supplier = store.suppliers.find((s) => s.id === po.supplierId)
  const items = po.items.map((item) => {
    const product = store.products.find((p) => p.id === item.productId)
    const remaining = item.orderedQuantity - item.receivedQuantity
    return {
      ...item,
      productName: product?.name ?? 'Unknown',
      sku: product?.sku ?? '-',
      remainingQuantity: remaining,
    }
  })

  const totalOrdered = items.reduce((sum, i) => sum + i.orderedQuantity, 0)
  const totalReceived = items.reduce((sum, i) => sum + i.receivedQuantity, 0)

  return {
    ...po,
    warehouseName: warehouse?.name ?? 'Unknown',
    supplierName: supplier?.name ?? 'Unknown',
    totalItems: po.items.length,
    totalOrdered,
    totalReceived,
    totalRemaining: totalOrdered - totalReceived,
    items,
  }
}

export type EnrichedPurchaseOrder = ReturnType<typeof enrichPurchaseOrder>

export async function fetchPurchaseOrders(filters?: {
  search?: string
  status?: string
}) {
  return apiRequest(() => {
    let list = getStore().purchaseOrders.map(enrichPurchaseOrder)

    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (po) =>
          po.poNumber.toLowerCase().includes(q) ||
          po.supplierName.toLowerCase().includes(q) ||
          po.warehouseName.toLowerCase().includes(q),
      )
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((po) => po.status === filters.status)
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  })
}

export async function fetchPurchaseOrderById(id: string) {
  return apiRequest(() => {
    const po = getStore().purchaseOrders.find((item) => item.id === id)
    if (!po) throw new ApiError('Purchase Order not found', 404)
    return enrichPurchaseOrder(po)
  })
}

export async function createGoodsReceipt(input: GoodsReceiptInput) {
  return apiRequest(() => {
    const store = getStore()
    const poIndex = store.purchaseOrders.findIndex((po) => po.id === input.purchaseOrderId)
    if (poIndex === -1) throw new ApiError('Purchase Order not found', 404)

    const po = store.purchaseOrders[poIndex]
    if (po.status !== 'ORDERED' && po.status !== 'PARTIALLY_RECEIVED') {
      throw new ApiError('Goods receipt is only allowed for active purchase orders', 400)
    }

    for (const receiptItem of input.items) {
      const poItem = po.items.find((i) => i.productId === receiptItem.productId)
      if (!poItem) throw new ApiError('Product not found in purchase order', 400)

      const remaining = poItem.orderedQuantity - poItem.receivedQuantity
      if (receiptItem.quantity <= 0) {
        throw new ApiError('Receive quantity must be greater than 0', 400)
      }
      if (receiptItem.quantity > remaining) {
        throw new ApiError(
          `Receive quantity exceeds remaining quantity for ${receiptItem.productId}`,
          400,
        )
      }
    }

    const now = new Date().toISOString()
    const receiptNumber = nextReceiptNumber(store)

    const receipt = {
      id: `gr-${crypto.randomUUID().slice(0, 8)}`,
      receiptNumber,
      purchaseOrderId: po.id,
      items: input.items,
      receivedBy: input.receivedBy,
      createdAt: now,
    }

    const updatedItems = po.items.map((item) => {
      const receiptItem = input.items.find((r) => r.productId === item.productId)
      if (!receiptItem) return item
      return {
        ...item,
        receivedQuantity: item.receivedQuantity + receiptItem.quantity,
      }
    })

    const updatedPo: PurchaseOrder = {
      ...po,
      items: updatedItems,
      status: derivePoStatus(updatedItems),
      updatedAt: now,
    }

    updateStore((s) => {
      s.purchaseOrders[poIndex] = updatedPo
      s.goodsReceipts.push(receipt)
      s.counters = store.counters

      for (const receiptItem of input.items) {
        const stockIndex = s.inventoryStocks.findIndex(
          (stock) =>
            stock.productId === receiptItem.productId &&
            stock.warehouseId === po.warehouseId,
        )

        if (stockIndex >= 0) {
          s.inventoryStocks[stockIndex] = {
            ...s.inventoryStocks[stockIndex],
            quantity: s.inventoryStocks[stockIndex].quantity + receiptItem.quantity,
          }
        } else {
          s.inventoryStocks.push({
            id: `inv-${crypto.randomUUID().slice(0, 8)}`,
            productId: receiptItem.productId,
            warehouseId: po.warehouseId,
            quantity: receiptItem.quantity,
          })
        }

        s.inventoryMovements.push({
          id: `mov-${crypto.randomUUID().slice(0, 8)}`,
          productId: receiptItem.productId,
          warehouseId: po.warehouseId,
          quantity: receiptItem.quantity,
          type: 'PURCHASE_RECEIPT',
          referenceNumber: receiptNumber,
          createdAt: now,
        })
      }
    })

    return {
      receipt,
      purchaseOrder: enrichPurchaseOrder(updatedPo),
    }
  })
}
