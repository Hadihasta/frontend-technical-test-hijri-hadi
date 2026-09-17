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

export const warehouses: Warehouse[] = [
  { id: 'wh-1', name: 'Jakarta Warehouse', location: 'Jakarta' },
  { id: 'wh-2', name: 'Main Warehouse', location: 'Surabaya' },
  { id: 'wh-3', name: 'Bandung Hub', location: 'Bandung' },
]

export const suppliers: Supplier[] = [
  { id: 'sup-1', name: 'Evindo Supply Co.' },
  { id: 'sup-2', name: 'Global Industrial Parts' },
]

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Industrial Oil',
    sku: 'OIL-001',
    unit: 'PCS',
    supplierId: 'sup-1',
  },
  {
    id: 'prod-2',
    name: 'Safety Gloves',
    sku: 'SAFE-001',
    unit: 'BOX',
    supplierId: 'sup-1',
  },
  {
    id: 'prod-3',
    name: 'Industrial Filter A',
    sku: 'FLT-001',
    unit: 'PCS',
    supplierId: 'sup-2',
  },
  {
    id: 'prod-4',
    name: 'Warehouse Pallet',
    sku: 'PLT-001',
    unit: 'PCS',
    supplierId: 'sup-2',
  },
  {
    id: 'prod-5',
    name: 'Packaging Tape',
    sku: 'PKG-001',
    unit: 'ROLL',
    supplierId: 'sup-1',
  },
]

export const purchaseRequests: PurchaseRequest[] = [
  {
    id: 'pr-1',
    requestNumber: 'PR-2026-00001',
    warehouseId: 'wh-1',
    requestedBy: 'John Doe',
    status: 'APPROVED',
    items: [
      { productId: 'prod-1', quantity: 100, unit: 'PCS' },
      { productId: 'prod-2', quantity: 20, unit: 'BOX' },
    ],
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-02T10:00:00.000Z',
  },
  {
    id: 'pr-2',
    requestNumber: 'PR-2026-00002',
    warehouseId: 'wh-2',
    requestedBy: 'John Doe',
    status: 'SUBMITTED',
    items: [{ productId: 'prod-3', quantity: 50, unit: 'PCS' }],
    createdAt: '2026-09-10T14:30:00.000Z',
    updatedAt: '2026-09-10T14:30:00.000Z',
  },
  {
    id: 'pr-3',
    requestNumber: 'PR-2026-00003',
    warehouseId: 'wh-1',
    requestedBy: 'John Doe',
    status: 'DRAFT',
    items: [{ productId: 'prod-4', quantity: 10, unit: 'PCS' }],
    createdAt: '2026-09-14T09:00:00.000Z',
    updatedAt: '2026-09-14T09:00:00.000Z',
  },
  {
    id: 'pr-4',
    requestNumber: 'PR-2026-00004',
    warehouseId: 'wh-3',
    requestedBy: 'Sarah Lim',
    status: 'REJECTED',
    items: [{ productId: 'prod-5', quantity: 200, unit: 'ROLL' }],
    rejectionReason: 'Budget not approved for this quarter.',
    createdAt: '2026-09-05T11:00:00.000Z',
    updatedAt: '2026-09-06T09:00:00.000Z',
  },
  {
    id: 'pr-5',
    requestNumber: 'PR-2026-00005',
    warehouseId: 'wh-2',
    requestedBy: 'John Doe',
    status: 'SUBMITTED',
    items: [
      { productId: 'prod-1', quantity: 30, unit: 'PCS' },
      { productId: 'prod-5', quantity: 15, unit: 'ROLL' },
    ],
    createdAt: '2026-09-15T16:00:00.000Z',
    updatedAt: '2026-09-15T16:00:00.000Z',
  },
]

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-00001',
    purchaseRequestId: 'pr-1',
    supplierId: 'sup-1',
    warehouseId: 'wh-1',
    status: 'PARTIALLY_RECEIVED',
    items: [
      { productId: 'prod-1', orderedQuantity: 100, receivedQuantity: 60, unit: 'PCS' },
      { productId: 'prod-2', orderedQuantity: 20, receivedQuantity: 20, unit: 'BOX' },
    ],
    createdAt: '2026-09-02T11:00:00.000Z',
    updatedAt: '2026-09-08T15:00:00.000Z',
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-00002',
    purchaseRequestId: 'pr-2',
    supplierId: 'sup-2',
    warehouseId: 'wh-2',
    status: 'ORDERED',
    items: [{ productId: 'prod-3', orderedQuantity: 50, receivedQuantity: 0, unit: 'PCS' }],
    createdAt: '2026-09-11T08:00:00.000Z',
    updatedAt: '2026-09-11T08:00:00.000Z',
  },
]

export const goodsReceipts: GoodsReceipt[] = [
  {
    id: 'gr-1',
    receiptNumber: 'GR-2026-000001',
    purchaseOrderId: 'po-1',
    items: [
      { productId: 'prod-1', quantity: 40 },
      { productId: 'prod-2', quantity: 20 },
    ],
    receivedBy: 'John Doe',
    createdAt: '2026-09-05T10:00:00.000Z',
  },
  {
    id: 'gr-2',
    receiptNumber: 'GR-2026-000002',
    purchaseOrderId: 'po-1',
    items: [{ productId: 'prod-1', quantity: 20 }],
    receivedBy: 'John Doe',
    createdAt: '2026-09-08T15:00:00.000Z',
  },
]

export const inventoryStocks: InventoryStock[] = [
  { id: 'inv-1', productId: 'prod-1', warehouseId: 'wh-1', quantity: 60 },
  { id: 'inv-2', productId: 'prod-2', warehouseId: 'wh-1', quantity: 20 },
  { id: 'inv-3', productId: 'prod-3', warehouseId: 'wh-2', quantity: 120 },
  { id: 'inv-4', productId: 'prod-4', warehouseId: 'wh-3', quantity: 45 },
]

export const inventoryMovements: InventoryMovement[] = [
  {
    id: 'mov-1',
    productId: 'prod-1',
    warehouseId: 'wh-1',
    quantity: 40,
    type: 'PURCHASE_RECEIPT',
    referenceNumber: 'GR-2026-000001',
    createdAt: '2026-09-05T10:00:00.000Z',
  },
  {
    id: 'mov-2',
    productId: 'prod-2',
    warehouseId: 'wh-1',
    quantity: 20,
    type: 'PURCHASE_RECEIPT',
    referenceNumber: 'GR-2026-000001',
    createdAt: '2026-09-05T10:00:00.000Z',
  },
  {
    id: 'mov-3',
    productId: 'prod-1',
    warehouseId: 'wh-1',
    quantity: 20,
    type: 'PURCHASE_RECEIPT',
    referenceNumber: 'GR-2026-000002',
    createdAt: '2026-09-08T15:00:00.000Z',
  },
]
