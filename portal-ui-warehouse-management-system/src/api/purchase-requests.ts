import { ApiError, apiRequest } from '@/api/client'
import {
  getStore,
  nextPoNumber,
  nextRequestNumber,
  updateStore,
} from '@/mock/store'
import type {
  CreatePurchaseRequestInput,
  PurchaseRequest,
  UpdatePurchaseRequestInput,
} from '@/types'

function enrichPurchaseRequest(pr: PurchaseRequest) {
  const store = getStore()
  const warehouse = store.warehouses.find((w) => w.id === pr.warehouseId)
  const items = pr.items.map((item) => {
    const product = store.products.find((p) => p.id === item.productId)
    return {
      ...item,
      productName: product?.name ?? 'Unknown',
      sku: product?.sku ?? '-',
    }
  })
  return {
    ...pr,
    warehouseName: warehouse?.name ?? 'Unknown',
    totalItems: pr.items.length,
    items,
  }
}

export type EnrichedPurchaseRequest = ReturnType<typeof enrichPurchaseRequest>

export async function fetchPurchaseRequests(filters?: {
  search?: string
  status?: string
  warehouseId?: string
}) {
  return apiRequest(() => {
    let list = getStore().purchaseRequests.map(enrichPurchaseRequest)

    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (pr) =>
          pr.requestNumber.toLowerCase().includes(q) ||
          pr.requestedBy.toLowerCase().includes(q) ||
          pr.warehouseName.toLowerCase().includes(q),
      )
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((pr) => pr.status === filters.status)
    }

    if (filters?.warehouseId && filters.warehouseId !== 'ALL') {
      list = list.filter((pr) => pr.warehouseId === filters.warehouseId)
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  })
}

export async function fetchPurchaseRequestById(id: string) {
  return apiRequest(() => {
    const pr = getStore().purchaseRequests.find((item) => item.id === id)
    if (!pr) throw new ApiError('Purchase Request not found', 404)
    return enrichPurchaseRequest(pr)
  })
}

export async function createPurchaseRequest(input: CreatePurchaseRequestInput) {
  return apiRequest(() => {
    const store = getStore()
    const now = new Date().toISOString()
    const id = `pr-${crypto.randomUUID().slice(0, 8)}`

    const pr: PurchaseRequest = {
      id,
      requestNumber: nextRequestNumber(store),
      warehouseId: input.warehouseId,
      requestedBy: input.requestedBy,
      status: 'DRAFT',
      items: input.items,
      createdAt: now,
      updatedAt: now,
    }

    store.purchaseRequests.push(pr)
    updateStore((s) => {
      s.purchaseRequests = store.purchaseRequests
      s.counters = store.counters
    })

    return enrichPurchaseRequest(pr)
  })
}

export async function updatePurchaseRequest(id: string, input: UpdatePurchaseRequestInput) {
  return apiRequest(() => {
    const store = getStore()
    const index = store.purchaseRequests.findIndex((item) => item.id === id)
    if (index === -1) throw new ApiError('Purchase Request not found', 404)

    const current = store.purchaseRequests[index]
    if (current.status !== 'DRAFT') {
      throw new ApiError('Only DRAFT purchase requests can be edited', 400)
    }

    const updated: PurchaseRequest = {
      ...current,
      warehouseId: input.warehouseId ?? current.warehouseId,
      items: input.items ?? current.items,
      updatedAt: new Date().toISOString(),
    }

    updateStore((s) => {
      s.purchaseRequests[index] = updated
    })

    return enrichPurchaseRequest(updated)
  })
}

export async function submitPurchaseRequest(id: string) {
  return apiRequest(() => {
    const store = getStore()
    const index = store.purchaseRequests.findIndex((item) => item.id === id)
    if (index === -1) throw new ApiError('Purchase Request not found', 404)

    const current = store.purchaseRequests[index]
    if (current.status !== 'DRAFT') {
      throw new ApiError('Only DRAFT purchase requests can be submitted', 400)
    }
    if (current.items.length === 0) {
      throw new ApiError('Purchase Request must have at least one item', 400)
    }

    const updated: PurchaseRequest = {
      ...current,
      status: 'SUBMITTED',
      updatedAt: new Date().toISOString(),
    }

    updateStore((s) => {
      s.purchaseRequests[index] = updated
    })

    return enrichPurchaseRequest(updated)
  })
}

export async function approvePurchaseRequest(id: string) {
  return apiRequest(() => {
    const store = getStore()
    const index = store.purchaseRequests.findIndex((item) => item.id === id)
    if (index === -1) throw new ApiError('Purchase Request not found', 404)

    const current = store.purchaseRequests[index]
    if (current.status !== 'SUBMITTED') {
      throw new ApiError('Only SUBMITTED purchase requests can be approved', 400)
    }

    const now = new Date().toISOString()
    const updated: PurchaseRequest = {
      ...current,
      status: 'APPROVED',
      updatedAt: now,
    }

    const supplierId =
      store.products.find((p) => p.id === current.items[0]?.productId)?.supplierId ??
      store.suppliers[0].id

    const po = {
      id: `po-${crypto.randomUUID().slice(0, 8)}`,
      poNumber: nextPoNumber(store),
      purchaseRequestId: current.id,
      supplierId,
      warehouseId: current.warehouseId,
      status: 'ORDERED' as const,
      items: current.items.map((item) => ({
        productId: item.productId,
        orderedQuantity: item.quantity,
        receivedQuantity: 0,
        unit: item.unit,
      })),
      createdAt: now,
      updatedAt: now,
    }

    updateStore((s) => {
      s.purchaseRequests[index] = updated
      s.purchaseOrders.push(po)
      s.counters = store.counters
    })

    return enrichPurchaseRequest(updated)
  })
}

export async function rejectPurchaseRequest(id: string, rejectionReason: string) {
  return apiRequest(() => {
    const store = getStore()
    const index = store.purchaseRequests.findIndex((item) => item.id === id)
    if (index === -1) throw new ApiError('Purchase Request not found', 404)

    const current = store.purchaseRequests[index]
    if (current.status !== 'SUBMITTED') {
      throw new ApiError('Only SUBMITTED purchase requests can be rejected', 400)
    }

    const updated: PurchaseRequest = {
      ...current,
      status: 'REJECTED',
      rejectionReason,
      updatedAt: new Date().toISOString(),
    }

    updateStore((s) => {
      s.purchaseRequests[index] = updated
    })

    return enrichPurchaseRequest(updated)
  })
}
