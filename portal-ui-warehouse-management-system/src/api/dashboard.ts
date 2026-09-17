import { apiRequest } from '@/api/client'
import { getStore } from '@/mock/store'
import type { DashboardSummary, RecentActivity } from '@/types'

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest(() => {
    const store = getStore()
    return {
      totalPurchaseRequests: store.purchaseRequests.length,
      waitingForApproval: store.purchaseRequests.filter((pr) => pr.status === 'SUBMITTED')
        .length,
      activePurchaseOrders: store.purchaseOrders.filter(
        (po) => po.status === 'ORDERED' || po.status === 'PARTIALLY_RECEIVED',
      ).length,
      partiallyReceivedOrders: store.purchaseOrders.filter(
        (po) => po.status === 'PARTIALLY_RECEIVED',
      ).length,
    }
  })
}

export async function fetchRecentActivity(): Promise<RecentActivity[]> {
  return apiRequest(() => {
    const store = getStore()
    const activities: RecentActivity[] = []

    for (const pr of store.purchaseRequests) {
      const warehouse = store.warehouses.find((w) => w.id === pr.warehouseId)
      activities.push({
        id: pr.id,
        type: 'PURCHASE_REQUEST',
        referenceNumber: pr.requestNumber,
        status: pr.status,
        warehouseName: warehouse?.name ?? 'Unknown',
        createdAt: pr.updatedAt,
      })
    }

    for (const po of store.purchaseOrders) {
      const warehouse = store.warehouses.find((w) => w.id === po.warehouseId)
      activities.push({
        id: po.id,
        type: 'PURCHASE_ORDER',
        referenceNumber: po.poNumber,
        status: po.status,
        warehouseName: warehouse?.name ?? 'Unknown',
        createdAt: po.updatedAt,
      })
    }

    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
  })
}
