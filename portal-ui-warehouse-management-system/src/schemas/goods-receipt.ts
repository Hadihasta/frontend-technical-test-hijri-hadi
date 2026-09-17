import { z } from 'zod'

export const goodsReceiptItemSchema = z.object({
  productId: z.string(),
  receiveQuantity: z.coerce.number().gt(0, 'Receive quantity must be greater than 0'),
  remainingQuantity: z.number(),
})

export const goodsReceiptFormSchema = z
  .object({
    items: z.array(goodsReceiptItemSchema),
  })
  .superRefine((data, ctx) => {
    data.items.forEach((item, index) => {
      if (item.receiveQuantity > item.remainingQuantity) {
        ctx.addIssue({
          code: 'custom',
          message: 'Receive quantity cannot exceed remaining quantity',
          path: ['items', index, 'receiveQuantity'],
        })
      }
    })
  })

export type GoodsReceiptFormValues = z.infer<typeof goodsReceiptFormSchema>
