import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { createPurchaseRequest } from '@/api/purchase-requests'
import { PageHeader } from '@/components/shared/page-header'
import { PurchaseRequestForm } from '@/features/purchase-requests/purchase-request-form'
import type { PurchaseRequestFormValues } from '@/schemas/purchase-request'
import { useRole } from '@/providers/role-provider'

export const Route = createFileRoute('/purchase-requests/new')({
  component: NewPurchaseRequestPage,
})

function NewPurchaseRequestPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isUser, userName } = useRole()

  const mutation = useMutation({
    mutationFn: (values: PurchaseRequestFormValues) =>
      createPurchaseRequest({
        warehouseId: values.warehouseId,
        requestedBy: userName,
        items: values.items,
      }),
    onSuccess: (data) => {
      toast.success('Purchase Request saved as draft.')
      void queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void navigate({ to: '/purchase-requests/$id', params: { id: data.id } })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (!isUser) {
    return (
      <div className="rounded-[10px] border border-border bg-white p-6 text-sm text-dark-normal">
        Purchase request creation is only available for USER role.
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Create Purchase Request"
        description="Add warehouse, products, and quantities for internal procurement."
      />
      <div className="rounded-[10px] border border-border bg-white p-4 md:p-6">
        <PurchaseRequestForm
          submitLabel="Save Draft"
          isSubmitting={mutation.isPending}
          onSubmit={async (values) => {
            await mutation.mutateAsync(values)
          }}
        />
      </div>
    </div>
  )
}
