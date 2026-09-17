import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createGoodsReceipt } from '@/api/purchase-orders'
import type { EnrichedPurchaseOrder } from '@/api/purchase-orders'
import { FormField } from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  goodsReceiptFormSchema,
  type GoodsReceiptFormValues,
} from '@/schemas/goods-receipt'
import { useRole } from '@/providers/role-provider'

interface GoodsReceiptFormProps {
  purchaseOrder: EnrichedPurchaseOrder
  onSuccess?: () => void
}

export function GoodsReceiptForm({ purchaseOrder, onSuccess }: GoodsReceiptFormProps) {
  const queryClient = useQueryClient()
  const { userName } = useRole()

  const form = useForm<GoodsReceiptFormValues>({
    resolver: zodResolver(goodsReceiptFormSchema),
    defaultValues: {
      items: purchaseOrder.items
        .filter((item) => item.remainingQuantity > 0)
        .map((item) => ({
          productId: item.productId,
          receiveQuantity: 0,
          remainingQuantity: item.remainingQuantity,
        })),
    },
  })

  const mutation = useMutation({
    mutationFn: (values: GoodsReceiptFormValues) => {
      const receiptItems = values.items
        .filter((item) => item.receiveQuantity > 0)
        .map((item) => ({
          productId: item.productId,
          quantity: item.receiveQuantity,
        }))

      if (receiptItems.length === 0) {
        throw new Error('Enter at least one receive quantity greater than 0')
      }

      return createGoodsReceipt({
        purchaseOrderId: purchaseOrder.id,
        receivedBy: userName,
        items: receiptItems,
      })
    },
    onSuccess: () => {
      toast.success('Goods receipt recorded successfully.')
      void queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      void queryClient.invalidateQueries({ queryKey: ['inventory'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onSuccess?.()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const receivableItems = purchaseOrder.items.filter((item) => item.remainingQuantity > 0)

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      {receivableItems.map((item, index) => {
        const itemErrors = form.formState.errors.items?.[index]
        return (
          <div key={item.productId} className="rounded-[10px] border border-border p-4">
            <h4 className="text-[13px] font-medium">{item.productName}</h4>
            <dl className="mt-2 grid grid-cols-3 gap-3 text-[11px]">
              <div>
                <dt className="text-dark-light-active">Ordered</dt>
                <dd>{item.orderedQuantity}</dd>
              </div>
              <div>
                <dt className="text-dark-light-active">Already Received</dt>
                <dd>{item.receivedQuantity}</dd>
              </div>
              <div>
                <dt className="text-dark-light-active">Remaining</dt>
                <dd>{item.remainingQuantity}</dd>
              </div>
            </dl>
            <input type="hidden" {...form.register(`items.${index}.productId`)} />
            <input
              type="hidden"
              {...form.register(`items.${index}.remainingQuantity`, { valueAsNumber: true })}
            />
            <FormField
              label="Receive Now"
              className="mt-3"
              error={itemErrors?.receiveQuantity?.message}
            >
              <Input
                type="number"
                min={0}
                max={item.remainingQuantity}
                error={!!itemErrors?.receiveQuantity}
                {...form.register(`items.${index}.receiveQuantity`, { valueAsNumber: true })}
              />
            </FormField>
          </div>
        )
      })}

      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={mutation.isPending}>
          Record Receipt
        </Button>
      </div>
    </form>
  )
}
