import { z } from 'zod'

export const purchaseRequestItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().gt(0, 'Quantity must be greater than 0'),
  unit: z.string().min(1),
})

export const purchaseRequestFormSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  items: z.array(purchaseRequestItemSchema).min(1, 'At least one product is required'),
})

export type PurchaseRequestFormValues = z.infer<typeof purchaseRequestFormSchema>

export const rejectPurchaseRequestSchema = z.object({
  rejectionReason: z.string().trim().min(1, 'Rejection reason is required'),
})

export type RejectPurchaseRequestValues = z.infer<typeof rejectPurchaseRequestSchema>
