import { describe, expect, it } from 'vitest'
import { createGoodsReceipt, fetchPurchaseOrderById } from '@/api/purchase-orders'

describe('Goods Receipt API', () => {
  it('goods receipt cannot exceed remaining quantity', async () => {
    await expect(
      createGoodsReceipt({
        purchaseOrderId: 'po-1',
        receivedBy: 'John Doe',
        items: [{ productId: 'prod-1', quantity: 50 }],
      }),
    ).rejects.toThrow('Receive quantity exceeds remaining quantity')
  })

  it('successful goods receipt updates PO progress and status', async () => {
    const before = await fetchPurchaseOrderById('po-1')
    const remaining = before.items.find((item) => item.productId === 'prod-1')!.remainingQuantity

    await createGoodsReceipt({
      purchaseOrderId: 'po-1',
      receivedBy: 'John Doe',
      items: [{ productId: 'prod-1', quantity: remaining }],
    })

    const after = await fetchPurchaseOrderById('po-1')
    const updatedItem = after.items.find((item) => item.productId === 'prod-1')!

    expect(updatedItem.receivedQuantity).toBe(before.items[0].receivedQuantity + remaining)
    expect(updatedItem.remainingQuantity).toBe(0)
    expect(after.status).toBe('RECEIVED')
  })
})
