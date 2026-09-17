import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { fetchProducts, fetchWarehouses } from '@/api/inventory'
import { FormField } from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  purchaseRequestFormSchema,
  type PurchaseRequestFormValues,
} from '@/schemas/purchase-request'

interface PurchaseRequestFormProps {
  defaultValues?: PurchaseRequestFormValues
  submitLabel: string
  onSubmit: (values: PurchaseRequestFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function PurchaseRequestForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting,
}: PurchaseRequestFormProps) {
  const warehousesQuery = useQuery({ queryKey: ['warehouses'], queryFn: fetchWarehouses })
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: fetchProducts })

  const form = useForm<PurchaseRequestFormValues>({
    resolver: zodResolver(purchaseRequestFormSchema),
    defaultValues: defaultValues ?? {
      warehouseId: '',
      items: [{ productId: '', quantity: 1, unit: 'PCS' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const selectedProductIds = form.watch('items').map((item) => item.productId)

  const handleProductChange = (index: number, productId: string) => {
    const product = productsQuery.data?.find((p) => p.id === productId)
    form.setValue(`items.${index}.productId`, productId, { shouldValidate: true })
    if (product) {
      form.setValue(`items.${index}.unit`, product.unit, { shouldValidate: true })
    }
  }

  const validateDuplicateProducts = () => {
    const items = form.getValues('items')
    const ids = items.map((item) => item.productId).filter(Boolean)
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    if (duplicates.length > 0) {
      items.forEach((item, index) => {
        if (duplicates.includes(item.productId)) {
          form.setError(`items.${index}.productId`, {
            type: 'manual',
            message: 'Product has already been added.',
          })
        }
      })
      return false
    }
    return true
  }

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(async (values) => {
        if (!validateDuplicateProducts()) return
        await onSubmit(values)
      })}
      noValidate
    >
      <FormField
        label="Warehouse"
        htmlFor="warehouseId"
        error={form.formState.errors.warehouseId?.message}
        helperText="Select the receiving warehouse."
      >
        <Select
          value={form.watch('warehouseId')}
          onValueChange={(value) =>
            form.setValue('warehouseId', value, { shouldValidate: true })
          }
        >
          <SelectTrigger id="warehouseId" error={!!form.formState.errors.warehouseId}>
            <SelectValue placeholder="Select warehouse" />
          </SelectTrigger>
          <SelectContent>
            {warehousesQuery.data?.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[19px] font-semibold">Items</h3>
          <Button
            type="button"
            variant="default"
            onClick={() => append({ productId: '', quantity: 1, unit: 'PCS' })}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Product
          </Button>
        </div>

        {form.formState.errors.items?.message ? (
          <p className="mb-2 text-[10px] text-danger-fg" role="alert">
            {form.formState.errors.items.message}
          </p>
        ) : null}

        <div className="space-y-3">
          {fields.map((field, index) => {
            const itemErrors = form.formState.errors.items?.[index]
            const availableProducts =
              productsQuery.data?.filter(
                (product) =>
                  !selectedProductIds.includes(product.id) ||
                  product.id === form.watch(`items.${index}.productId`),
              ) ?? []

            return (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-3 rounded-[10px] border border-border p-4 md:grid-cols-[1fr_140px_100px_auto]"
              >
                <FormField
                  label="Product"
                  error={itemErrors?.productId?.message}
                >
                  <Select
                    value={form.watch(`items.${index}.productId`)}
                    onValueChange={(value) => handleProductChange(index, value)}
                  >
                    <SelectTrigger error={!!itemErrors?.productId}>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="Quantity"
                  error={itemErrors?.quantity?.message}
                >
                  <Input
                    type="number"
                    min={1}
                    error={!!itemErrors?.quantity}
                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </FormField>

                <FormField label="Unit">
                  <Input disabled {...form.register(`items.${index}.unit`)} />
                </FormField>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    aria-label="Remove product row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
