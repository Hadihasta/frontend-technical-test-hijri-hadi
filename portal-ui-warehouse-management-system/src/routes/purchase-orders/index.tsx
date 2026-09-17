import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { fetchPurchaseOrders } from '@/api/purchase-orders'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate } from '@/lib/format'

export const Route = createFileRoute('/purchase-orders/')({
  component: PurchaseOrdersPage,
})

const statusOptions = [
  'ALL',
  'DRAFT',
  'ORDERED',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED',
] as const

function PurchaseOrdersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('ALL')

  const query = useQuery({
    queryKey: ['purchase-orders', { search, status }],
    queryFn: () => fetchPurchaseOrders({ search, status }),
  })

  const hasFilters = useMemo(() => search.length > 0 || status !== 'ALL', [search, status])

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description="Monitor purchase orders and receiving progress across warehouses."
      />

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          placeholder="Search PO number, supplier, warehouse..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search purchase orders"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option === 'ALL' ? 'All Statuses' : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border bg-white">
        {query.isLoading ? <LoadingSkeleton rows={6} /> : null}

        {query.isError ? (
          <ErrorState
            title="Failed to load Purchase Orders."
            onRetry={() => void query.refetch()}
          />
        ) : null}

        {!query.isLoading && !query.isError && query.data?.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No Purchase Orders found.' : 'No Purchase Orders yet.'}
            description={
              hasFilters
                ? 'Try adjusting your search or filters.'
                : 'Purchase orders are created automatically when requests are approved.'
            }
          />
        ) : null}

        {!query.isLoading && !query.isError && query.data && query.data.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-[#FBFCFD] text-left text-[11px] text-dark-normal">
                    <th className="px-3 py-2.5 font-medium">PO Number</th>
                    <th className="px-3 py-2.5 font-medium">Supplier</th>
                    <th className="px-3 py-2.5 font-medium">Warehouse</th>
                    <th className="px-3 py-2.5 font-medium">Total Items</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 font-medium">Created At</th>
                    <th className="px-3 py-2.5 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.map((po) => (
                    <tr key={po.id} className="border-b border-border hover:bg-surface-light">
                      <td className="px-3 py-2.5 text-[11px]">{po.poNumber}</td>
                      <td className="px-3 py-2.5 text-[11px]">{po.supplierName}</td>
                      <td className="px-3 py-2.5 text-[11px]">{po.warehouseName}</td>
                      <td className="px-3 py-2.5 text-[11px]">{po.totalItems}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={po.status} />
                      </td>
                      <td className="px-3 py-2.5 text-[11px]">{formatDate(po.createdAt)}</td>
                      <td className="px-3 py-2.5">
                        <Button variant="default" asChild>
                          <Link to="/purchase-orders/$id" params={{ id: po.id }}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-3 md:hidden">
              {query.data.map((po) => (
                <article key={po.id} className="rounded-[10px] border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[13px] font-medium">{po.poNumber}</h3>
                      <p className="text-[11px] text-dark-normal">{po.supplierName}</p>
                    </div>
                    <StatusBadge status={po.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <dt className="text-dark-light-active">Warehouse</dt>
                      <dd>{po.warehouseName}</dd>
                    </div>
                    <div>
                      <dt className="text-dark-light-active">Items</dt>
                      <dd>{po.totalItems}</dd>
                    </div>
                  </dl>
                  <Button variant="default" className="mt-3 w-full" asChild>
                    <Link to="/purchase-orders/$id" params={{ id: po.id }}>
                      View Detail
                    </Link>
                  </Button>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
