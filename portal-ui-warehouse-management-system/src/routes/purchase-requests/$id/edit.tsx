import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { fetchPurchaseRequestById, updatePurchaseRequest } from '@/api/purchase-requests'
import { ErrorState } from '@/components/shared/error-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { PurchaseRequestForm } from '@/features/purchase-requests/purchase-request-form'
import type { PurchaseRequestFormValues } from '@/schemas/purchase-request'
import { useRole } from '@/providers/role-provider'

export const Route = createFileRoute('/purchase-requests/$id/edit')({
  component: EditPurchaseRequestPage,
})

function EditPurchaseRequestPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isUser } = useRole()

  const query = useQuery({
    queryKey: ['purchase-requests', id],
    queryFn: () => fetchPurchaseRequestById(id),
  })

  const mutation = useMutation({
    mutationFn: (values: PurchaseRequestFormValues) =>
      updatePurchaseRequest(id, {
        warehouseId: values.warehouseId,
        items: values.items,
      }),
    onSuccess: () => {
      toast.success('Purchase Request updated successfully.')
      void queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
      void navigate({ to: '/purchase-requests/$id', params: { id } })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (query.isLoading) return <LoadingSkeleton rows={6} />

  if (query.isError || !query.data) {
    return (
      <div className="rounded-[10px] border border-border bg-white">
        <ErrorState
          title="Failed to load Purchase Request."
          onRetry={() => void query.refetch()}
        />
      </div>
    )
  }

  if (!isUser || query.data.status !== 'DRAFT') {
    return (
      <div className="rounded-[10px] border border-border bg-white p-6 text-sm text-dark-normal">
        This purchase request cannot be edited.
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${query.data.requestNumber}`}
        description="Update warehouse, products, or quantities while the request is still in draft."
      />
      <div className="rounded-[10px] border border-border bg-white p-4 md:p-6">
        <PurchaseRequestForm
          submitLabel="Save Changes"
          isSubmitting={mutation.isPending}
          defaultValues={{
            warehouseId: query.data.warehouseId,
            items: query.data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unit: item.unit,
            })),
          }}
          onSubmit={async (values) => {
            await mutation.mutateAsync(values)
          }}
        />
      </div>
    </div>
  )
}
