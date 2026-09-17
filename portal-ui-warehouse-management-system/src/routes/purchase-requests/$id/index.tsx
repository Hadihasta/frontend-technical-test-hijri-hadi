import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  fetchPurchaseRequestById,
  submitPurchaseRequest,
} from '@/api/purchase-requests'
import { ErrorState } from '@/components/shared/error-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ApprovalActions } from '@/features/purchase-requests/approval-actions'
import { formatDate } from '@/lib/format'
import { useRole } from '@/providers/role-provider'

export const Route = createFileRoute('/purchase-requests/$id/')({
  component: PurchaseRequestDetailPage,
})

function PurchaseRequestDetailPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const { isUser, isApprover } = useRole()
  const [submitOpen, setSubmitOpen] = useState(false)

  const query = useQuery({
    queryKey: ['purchase-requests', id],
    queryFn: () => fetchPurchaseRequestById(id),
  })

  const submitMutation = useMutation({
    mutationFn: () => submitPurchaseRequest(id),
    onSuccess: () => {
      toast.success('Purchase Request submitted successfully.')
      void queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setSubmitOpen(false)
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

  const pr = query.data
  const canEdit = isUser && pr.status === 'DRAFT'
  const canSubmit = isUser && pr.status === 'DRAFT'
  const canApprove = isApprover && pr.status === 'SUBMITTED'

  return (
    <div>
      <PageHeader
        title={pr.requestNumber}
        description="Purchase request details and available actions based on status and role."
        actions={
          <div className="flex flex-wrap gap-2">
            {canEdit ? (
              <Button asChild>
                <Link to="/purchase-requests/$id/edit" params={{ id }}>
                  Edit
                </Link>
              </Button>
            ) : null}
            {canSubmit ? (
              <Button variant="primary" onClick={() => setSubmitOpen(true)}>
                Submit
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="rounded-[10px] border border-border bg-white p-4 md:p-5">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] text-dark-light-active">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={pr.status} />
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-dark-light-active">Warehouse</dt>
                <dd className="mt-1 text-[13px]">{pr.warehouseName}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-dark-light-active">Requested By</dt>
                <dd className="mt-1 text-[13px]">{pr.requestedBy}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-dark-light-active">Created Date</dt>
                <dd className="mt-1 text-[13px]">{formatDate(pr.createdAt)}</dd>
              </div>
            </dl>

            {pr.rejectionReason ? (
              <div className="mt-4 rounded-[8px] border border-danger-border bg-danger-bg p-3">
                <p className="text-[11px] font-medium text-danger-fg">Rejection Reason</p>
                <p className="mt-1 text-[12px] text-dark-normal">{pr.rejectionReason}</p>
              </div>
            ) : null}
          </section>

          <section className="overflow-hidden rounded-[10px] border border-border bg-white">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-[19px] font-semibold">Items</h3>
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-[#FBFCFD] text-left text-[11px] text-dark-normal">
                    <th className="px-3 py-2.5 font-medium">Product</th>
                    <th className="px-3 py-2.5 font-medium">SKU</th>
                    <th className="px-3 py-2.5 font-medium">Quantity</th>
                    <th className="px-3 py-2.5 font-medium">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {pr.items.map((item) => (
                    <tr key={item.productId} className="border-b border-border">
                      <td className="px-3 py-2.5 text-[11px]">{item.productName}</td>
                      <td className="px-3 py-2.5 text-[11px]">{item.sku}</td>
                      <td className="px-3 py-2.5 text-[11px]">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-[11px]">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-3 md:hidden">
              {pr.items.map((item) => (
                <div key={item.productId} className="rounded-[8px] border border-border p-3">
                  <p className="text-[13px] font-medium">{item.productName}</p>
                  <p className="text-[11px] text-dark-normal">SKU: {item.sku}</p>
                  <p className="mt-1 text-[11px]">
                    {item.quantity} {item.unit}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {canApprove ? (
          <aside className="rounded-[10px] border border-border bg-white p-4">
            <h3 className="text-[19px] font-semibold">Approval Actions</h3>
            <p className="mt-1 text-xs text-dark-normal">
              Review the request details before approving or rejecting.
            </p>
            <div className="mt-4">
              <ApprovalActions purchaseRequestId={pr.id} requestNumber={pr.requestNumber} />
            </div>
          </aside>
        ) : null}
      </div>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Purchase Request?</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <DialogBody>
            <DialogDescription>
              {pr.requestNumber} will be submitted for approval and can no longer be edited.
            </DialogDescription>
          </DialogBody>
          <DialogFooter>
            <Button variant="default" onClick={() => setSubmitOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
