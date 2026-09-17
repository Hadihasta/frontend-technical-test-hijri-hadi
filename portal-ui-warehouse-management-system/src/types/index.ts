export type UserRole = 'USER' | 'APPROVER'

export type PurchaseRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'ORDERED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED'

export type InventoryMovementType = 'PURCHASE_RECEIPT'

export interface Warehouse {
  id: string
  name: string
  location: string
}

export interface Product {
  id: string
  name: string
  sku: string
  unit: string
  supplierId: string
}

export interface Supplier {
  id: string
  name: string
}

export interface PurchaseRequestItem {
  productId: string
  quantity: number
  unit: string
}

export interface PurchaseRequest {
  id: string
  requestNumber: string
  warehouseId: string
  requestedBy: string
  status: PurchaseRequestStatus
  items: PurchaseRequestItem[]
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  productId: string
  orderedQuantity: number
  receivedQuantity: number
  unit: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  purchaseRequestId: string
  supplierId: string
  warehouseId: string
  status: PurchaseOrderStatus
  items: PurchaseOrderItem[]
  createdAt: string
  updatedAt: string
}

export interface GoodsReceiptItem {
  productId: string
  quantity: number
}

export interface GoodsReceipt {
  id: string
  receiptNumber: string
  purchaseOrderId: string
  items: GoodsReceiptItem[]
  receivedBy: string
  createdAt: string
}

export interface InventoryStock {
  id: string
  productId: string
  warehouseId: string
  quantity: number
}

export interface InventoryMovement {
  id: string
  productId: string
  warehouseId: string
  quantity: number
  type: InventoryMovementType
  referenceNumber: string
  createdAt: string
}

export interface DashboardSummary {
  totalPurchaseRequests: number
  waitingForApproval: number
  activePurchaseOrders: number
  partiallyReceivedOrders: number
}

export interface RecentActivity {
  id: string
  type: 'PURCHASE_REQUEST' | 'PURCHASE_ORDER' | 'GOODS_RECEIPT'
  referenceNumber: string
  status: string
  warehouseName: string
  createdAt: string
}

export interface CreatePurchaseRequestInput {
  warehouseId: string
  requestedBy: string
  items: PurchaseRequestItem[]
}

export interface UpdatePurchaseRequestInput {
  warehouseId?: string
  items?: PurchaseRequestItem[]
}

export interface GoodsReceiptInput {
  purchaseOrderId: string
  receivedBy: string
  items: GoodsReceiptItem[]
}
