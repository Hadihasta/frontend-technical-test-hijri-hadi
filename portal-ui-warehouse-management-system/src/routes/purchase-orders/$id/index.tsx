import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { fetchPurchaseOrderById } from '@/api/purchase-orders'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { GoodsReceiptForm } from '@/features/purchase-orders/goods-receipt-form'
import { formatDate } from '@/lib/format'
import { useRole } from '@/providers/role-provider'

export const Route = createFileRoute('/purchase-orders/$id/')({
  component: PurchaseOrderDetailPage,
})

function PurchaseOrderDetailPage() {
  const { id } = Route.useParams()
  const { isUser } = useRole()
  const [receiptOpen, setReceiptOpen] = useState(false)

  const query = useQuery({
    queryKey: ['purchase-orders', id],
    queryFn: () => fetchPurchaseOrderById(id),
  })

  if (query.isLoading) return <LoadingSkeleton rows={6} />

  if (query.isError || !query.data) {
    return (
      <div className="rounded-[10px] border border-border bg-white">
        <ErrorState
          title="Failed to load Purchase Order."
          onRetry={() => void query.refetch()}
        />
      </div>
    )
  }

  const po = query.data
  const progress =
    po.totalOrdered > 0 ? Math.round((po.totalReceived / po.totalOrdered) * 100) : 0
  const canReceive =
    isUser && (po.status === 'ORDERED' || po.status === 'PARTIALLY_RECEIVED')

  return (
    <div>
      <PageHeader
        title={po.poNumber}
        description="Purchase order details, receiving progress, and goods receipt."
        actions={
          canReceive ? (
            <Button variant="primary" onClick={() => setReceiptOpen(true)}>
              Record Goods Receipt
            </Button>
          ) : null
        }
      />

      <div className="space-y-4">
        <section className="rounded-[10px] border border-border bg-white p-4 md:p-5">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-[11px] text-dark-light-active">Supplier</dt>
              <dd className="mt-1 text-[13px]">{po.supplierName}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-dark-light-active">Warehouse</dt>
              <dd className="mt-1 text-[13px]">{po.warehouseName}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-dark-light-active">Status</dt>
              <dd className="mt-1">
                <StatusBadge status={po.status} />
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-dark-light-active">Created At</dt>
              <dd className="mt-1 text-[13px]">{formatDate(po.createdAt)}</dd>
            </div>
          </dl>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="text-dark-normal">Receiving Progress</span>
              <span className="font-medium">
                {po.totalReceived} / {po.totalOrdered} Received
              </span>
            </div>
            <Progress value={progress} aria-label="Receiving progress" />
          </div>
        </section>

        <section className="overflow-hidden rounded-[10px] border border-border bg-white">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-[19px] font-semibold">Products</h3>
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-[#FBFCFD] text-left text-[11px] text-dark-normal">
                  <th className="px-3 py-2.5 font-medium">Product</th>
                  <th className="px-3 py-2.5 font-medium">Ordered</th>
                  <th className="px-3 py-2.5 font-medium">Received</th>
                  <th className="px-3 py-2.5 font-medium">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item) => (
                  <tr key={item.productId} className="border-b border-border">
                    <td className="px-3 py-2.5 text-[11px]">{item.productName}</td>
                    <td className="px-3 py-2.5 text-[11px]">{item.orderedQuantity}</td>
                    <td className="px-3 py-2.5 text-[11px]">{item.receivedQuantity}</td>
                    <td className="px-3 py-2.5 text-[11px]">{item.remainingQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 p-3 md:hidden">
            {po.items.map((item) => (
              <div key={item.productId} className="rounded-[8px] border border-border p-3">
                <p className="text-[13px] font-medium">{item.productName}</p>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <dt className="text-dark-light-active">Ordered</dt>
                    <dd>{item.orderedQuantity}</dd>
                  </div>
                  <div>
                    <dt className="text-dark-light-active">Received</dt>
                    <dd>{item.receivedQuantity}</dd>
                  </div>
                  <div>
                    <dt className="text-dark-light-active">Remaining</dt>
                    <dd>{item.remainingQuantity}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Goods Receipt — {po.poNumber}</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <DialogBody>
            <GoodsReceiptForm
              purchaseOrder={po}
              onSuccess={() => {
                setReceiptOpen(false)
                void query.refetch()
              }}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  )
}
