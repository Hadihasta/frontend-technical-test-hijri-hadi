import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { fetchInventory, fetchInventoryByProduct, fetchWarehouses } from '@/api/inventory'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate } from '@/lib/format'

export const Route = createFileRoute('/inventory/')({
  component: InventoryPage,
})

function InventoryPage() {
  const [search, setSearch] = useState('')
  const [warehouseId, setWarehouseId] = useState('ALL')
  const [selectedStock, setSelectedStock] = useState<{
    productId: string
    warehouseId: string
    productName: string
  } | null>(null)

  const warehousesQuery = useQuery({ queryKey: ['warehouses'], queryFn: fetchWarehouses })

  const query = useQuery({
    queryKey: ['inventory', { search, warehouseId }],
    queryFn: () => fetchInventory({ search, warehouseId }),
  })

  const detailQuery = useQuery({
    queryKey: ['inventory', 'detail', selectedStock?.productId, selectedStock?.warehouseId],
    queryFn: () =>
      fetchInventoryByProduct(selectedStock!.productId, selectedStock!.warehouseId),
    enabled: !!selectedStock,
  })

  const hasFilters = useMemo(
    () => search.length > 0 || warehouseId !== 'ALL',
    [search, warehouseId],
  )

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Current stock levels across warehouses with movement history."
      />

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          placeholder="Search product, SKU, warehouse..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search inventory"
        />
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
            title="Failed to load Inventory."
            onRetry={() => void query.refetch()}
          />
        ) : null}

        {!query.isLoading && !query.isError && query.data?.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No inventory records found.' : 'No inventory records yet.'}
            description={
              hasFilters
                ? 'Try adjusting your search or warehouse filter.'
                : 'Inventory updates automatically after goods receipts are recorded.'
            }
          />
        ) : null}

        {!query.isLoading && !query.isError && query.data && query.data.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-[#FBFCFD] text-left text-[11px] text-dark-normal">
                    <th className="px-3 py-2.5 font-medium">Product</th>
                    <th className="px-3 py-2.5 font-medium">SKU</th>
                    <th className="px-3 py-2.5 font-medium">Warehouse</th>
                    <th className="px-3 py-2.5 font-medium">Current Stock</th>
                    <th className="px-3 py-2.5 font-medium">Unit</th>
                    <th className="px-3 py-2.5 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-surface-light">
                      <td className="px-3 py-2.5 text-[11px]">{item.productName}</td>
                      <td className="px-3 py-2.5 text-[11px]">{item.sku}</td>
                      <td className="px-3 py-2.5 text-[11px]">{item.warehouseName}</td>
                      <td className="px-3 py-2.5 text-[11px]">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-[11px]">{item.unit}</td>
                      <td className="px-3 py-2.5">
                        <Button
                          variant="default"
                          onClick={() =>
                            setSelectedStock({
                              productId: item.productId,
                              warehouseId: item.warehouseId,
                              productName: item.productName,
                            })
                          }
                        >
                          Movements
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-3 md:hidden">
              {query.data.map((item) => (
                <article key={item.id} className="rounded-[10px] border border-border p-3">
                  <h3 className="text-[13px] font-medium">{item.productName}</h3>
                  <p className="text-[11px] text-dark-normal">SKU: {item.sku}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <dt className="text-dark-light-active">Warehouse</dt>
                      <dd>{item.warehouseName}</dd>
                    </div>
                    <div>
                      <dt className="text-dark-light-active">Stock</dt>
                      <dd>
                        {item.quantity} {item.unit}
                      </dd>
                    </div>
                  </dl>
                  <Button
                    variant="default"
                    className="mt-3 w-full"
                    onClick={() =>
                      setSelectedStock({
                        productId: item.productId,
                        warehouseId: item.warehouseId,
                        productName: item.productName,
                      })
                    }
                  >
                    View Movements
                  </Button>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <Dialog open={!!selectedStock} onOpenChange={(open) => !open && setSelectedStock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStock?.productName} — Movement History</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <DialogBody>
            {detailQuery.isLoading ? <LoadingSkeleton rows={3} /> : null}
            {detailQuery.data ? (
              <div>
                <p className="text-[13px] font-medium">
                  Current Stock: {detailQuery.data.quantity} {detailQuery.data.unit}
                </p>
                <ul className="mt-4 space-y-3">
                  {detailQuery.data.movements.length === 0 ? (
                    <li className="text-[11px] text-dark-normal">No movements recorded.</li>
                  ) : (
                    detailQuery.data.movements.map((movement) => (
                      <li
                        key={movement.id}
                        className="rounded-[8px] border border-border p-3 text-[11px]"
                      >
                        <div className="font-medium text-success-fg">+{movement.quantity}</div>
                        <div className="text-dark-normal">{movement.type}</div>
                        <div className="text-dark-light-active">
                          {movement.referenceNumber} · {formatDate(movement.createdAt)}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ) : null}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  )
}
