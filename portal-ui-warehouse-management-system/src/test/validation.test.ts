import { describe, expect, it } from 'vitest'
import { purchaseRequestFormSchema } from '@/schemas/purchase-request'
import { goodsReceiptFormSchema } from '@/schemas/goods-receipt'

describe('Form validation schemas', () => {
  it('quantity validation requires value greater than 0', () => {
    const result = purchaseRequestFormSchema.safeParse({
      warehouseId: 'wh-1',
      items: [{ productId: 'prod-1', quantity: 0, unit: 'PCS' }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes('greater than 0'))).toBe(
        true,
      )
    }
  })

  it('warehouse is required', () => {
    const result = purchaseRequestFormSchema.safeParse({
      warehouseId: '',
      items: [{ productId: 'prod-1', quantity: 5, unit: 'PCS' }],
    })

    expect(result.success).toBe(false)
  })

  it('goods receipt quantity cannot exceed remaining', () => {
    const result = goodsReceiptFormSchema.safeParse({
      items: [{ productId: 'prod-1', receiveQuantity: 30, remainingQuantity: 20 }],
    })

    expect(result.success).toBe(false)
  })
})
