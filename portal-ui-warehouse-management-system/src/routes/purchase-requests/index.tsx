import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { fetchPurchaseRequests } from '@/api/purchase-requests'
import { fetchWarehouses } from '@/api/inventory'
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
import { useRole } from '@/providers/role-provider'

export const Route = createFileRoute('/purchase-requests/')({
  component: PurchaseRequestsPage,
})

const statusOptions = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'] as const

function PurchaseRequestsPage() {
  const { isUser } = useRole()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('ALL')
  const [warehouseId, setWarehouseId] = useState('ALL')

  const warehousesQuery = useQuery({ queryKey: ['warehouses'], queryFn: fetchWarehouses })

  const query = useQuery({
    queryKey: ['purchase-requests', { search, status, warehouseId }],
    queryFn: () => fetchPurchaseRequests({ search, status, warehouseId }),
  })

  const hasFilters = useMemo(
    () => search.length > 0 || status !== 'ALL' || warehouseId !== 'ALL',
    [search, status, warehouseId],
  )

  return (
    <div>
      <PageHeader
        title="Purchase Requests"
        description="Track internal purchase requests from draft through approval."
        actions={
          isUser ? (
            <Button variant="primary" asChild>
              <Link to="/purchase-requests/new">Create Purchase Request</Link>
            </Button>
          ) : null
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input
          placeholder="Search request number, requester, warehouse..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search purchase requests"
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
        <Select value={warehouseId} onValueChange={setWarehouseId}>
          <SelectTrigger aria-label="Filter by warehouse">
            <SelectValue placeholder="Warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Warehouses</SelectItem>
            {warehousesQuery.data?.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border bg-white">
        {query.isLoading ? <LoadingSkeleton rows={6} /> : null}

        {query.isError ? (
          <ErrorState
            title="Failed to load Purchase Requests."
            onRetry={() => void query.refetch()}
          />
        ) : null}

        {!query.isLoading && !query.isError && query.data?.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No Purchase Requests found.' : 'No Purchase Requests yet.'}
            description={
              hasFilters
                ? 'Try adjusting your search or filters.'
                : 'Create your first purchase request to start requesting stock.'
            }
            actionLabel={!hasFilters && isUser ? 'Create Request' : undefined}
            onAction={
              !hasFilters && isUser
                ? () => {
                    window.location.href = '/purchase-requests/new'
                  }
                : undefined
            }
          />
        ) : null}

        {!query.isLoading && !query.isError && query.data && query.data.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-[#FBFCFD] text-left text-[11px] text-dark-normal">
                    <th className="px-3 py-2.5 font-medium">Request Number</th>
                    <th className="px-3 py-2.5 font-medium">Warehouse</th>
                    <th className="px-3 py-2.5 font-medium">Requested By</th>
                    <th className="px-3 py-2.5 font-medium">Total Items</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 font-medium">Created At</th>
                    <th className="px-3 py-2.5 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.map((pr) => (
                    <tr key={pr.id} className="border-b border-border hover:bg-surface-light">
                      <td className="px-3 py-2.5 text-[11px]">{pr.requestNumber}</td>
                      <td className="px-3 py-2.5 text-[11px]">{pr.warehouseName}</td>
                      <td className="px-3 py-2.5 text-[11px]">{pr.requestedBy}</td>
                      <td className="px-3 py-2.5 text-[11px]">{pr.totalItems}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={pr.status} />
                      </td>
                      <td className="px-3 py-2.5 text-[11px]">{formatDate(pr.createdAt)}</td>
                      <td className="px-3 py-2.5">
                        <Button variant="default" asChild>
                          <Link to="/purchase-requests/$id" params={{ id: pr.id }}>
                            {pr.status === 'DRAFT' && isUser ? 'Edit' : 'View'}
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-3 md:hidden">
              {query.data.map((pr) => (
                <article
                  key={pr.id}
                  className="rounded-[10px] border border-border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[13px] font-medium">{pr.requestNumber}</h3>
                      <p className="text-[11px] text-dark-normal">{pr.warehouseName}</p>
                    </div>
                    <StatusBadge status={pr.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <dt className="text-dark-light-active">Requested By</dt>
                      <dd>{pr.requestedBy}</dd>
                    </div>
                    <div>
                      <dt className="text-dark-light-active">Items</dt>
                      <dd>{pr.totalItems}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-dark-light-active">Created</dt>
                      <dd>{formatDate(pr.createdAt)}</dd>
                    </div>
                  </dl>
                  <Button variant="default" className="mt-3 w-full" asChild>
                    <Link to="/purchase-requests/$id" params={{ id: pr.id }}>
                      {pr.status === 'DRAFT' && isUser ? 'Edit' : 'View Detail'}
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
