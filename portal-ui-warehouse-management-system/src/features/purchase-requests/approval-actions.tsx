import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { approvePurchaseRequest, rejectPurchaseRequest } from '@/api/purchase-requests'
import { FormField } from '@/components/shared/form-field'
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
import { Textarea } from '@/components/ui/textarea'
import {
  rejectPurchaseRequestSchema,
  type RejectPurchaseRequestValues,
} from '@/schemas/purchase-request'

interface ApprovalActionsProps {
  purchaseRequestId: string
  requestNumber: string
}

export function ApprovalActions({ purchaseRequestId, requestNumber }: ApprovalActionsProps) {
  const queryClient = useQueryClient()
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  const approveMutation = useMutation({
    mutationFn: () => approvePurchaseRequest(purchaseRequestId),
    onSuccess: () => {
      toast.success('Purchase Request approved successfully.')
      void queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setApproveOpen(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const rejectForm = useForm<RejectPurchaseRequestValues>({
    resolver: zodResolver(rejectPurchaseRequestSchema),
    defaultValues: { rejectionReason: '' },
  })

  const rejectMutation = useMutation({
    mutationFn: (values: RejectPurchaseRequestValues) =>
      rejectPurchaseRequest(purchaseRequestId, values.rejectionReason),
    onSuccess: () => {
      toast.success('Purchase Request rejected.')
      void queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setRejectOpen(false)
      rejectForm.reset()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => setApproveOpen(true)}>
          Approve
        </Button>
        <Button variant="destructive" onClick={() => setRejectOpen(true)}>
          Reject
        </Button>
      </div>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Purchase Request?</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <DialogBody>
            <DialogDescription>
              {requestNumber} will move to Approved and a Purchase Order will be created
              automatically.
            </DialogDescription>
          </DialogBody>
          <DialogFooter>
            <Button variant="default" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={approveMutation.isPending}
              onClick={() => approveMutation.mutate()}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Purchase Request</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <DialogBody>
            <form
              id="reject-form"
              className="space-y-3"
              onSubmit={rejectForm.handleSubmit((values) => rejectMutation.mutate(values))}
            >
              <FormField
                label="Rejection Reason"
                error={rejectForm.formState.errors.rejectionReason?.message}
              >
                <Textarea
                  error={!!rejectForm.formState.errors.rejectionReason}
                  placeholder="Provide a reason for rejection"
                  {...rejectForm.register('rejectionReason')}
                />
              </FormField>
            </form>
          </DialogBody>
          <DialogFooter>
            <Button variant="default" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              type="submit"
              form="reject-form"
              loading={rejectMutation.isPending}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
