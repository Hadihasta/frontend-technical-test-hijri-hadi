import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchDashboardSummary, fetchRecentActivity } from '@/api/dashboard'
import { ErrorState } from '@/components/shared/error-state'
import { LoadingSkeleton, SummaryCardsSkeleton } from '@/components/shared/loading-skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { SummaryCard } from '@/components/shared/summary-card'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/format'
import { useRole } from '@/providers/role-provider'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { isUser } = useRole()

  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: fetchDashboardSummary,
  })

  const activityQuery = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: fetchRecentActivity,
  })

  const isLoading = summaryQuery.isLoading || activityQuery.isLoading
  const isError = summaryQuery.isError || activityQuery.isError

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of procurement requests, approvals, purchase orders, and receiving progress."
        actions={
          isUser ? (
            <Button variant="primary" asChild>
              <Link to="/purchase-requests/new">Create Purchase Request</Link>
            </Button>
          ) : null
        }
      />

      {isLoading ? <SummaryCardsSkeleton /> : null}

      {isError ? (
        <div className="rounded-[10px] border border-border bg-white">
          <ErrorState
            title="Failed to load dashboard."
            onRetry={() => {
              void summaryQuery.refetch()
              void activityQuery.refetch()
            }}
          />
        </div>
      ) : null}

      {!isLoading && !isError && summaryQuery.data ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Purchase Requests"
            value={summaryQuery.data.totalPurchaseRequests}
          />
          <SummaryCard
            label="Waiting for Approval"
            value={summaryQuery.data.waitingForApproval}
            helpText="Requires approver action"
          />
          <SummaryCard
            label="Active Purchase Orders"
            value={summaryQuery.data.activePurchaseOrders}
          />
          <SummaryCard
            label="Partially Received Orders"
            value={summaryQuery.data.partiallyReceivedOrders}
            helpText="Receiving in progress"
          />
        </div>
      ) : null}

      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-[19px] font-semibold">Recent Activity</h3>
            <p className="mt-0.5 text-xs text-dark-normal">Latest procurement transactions</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-border bg-white">
          {activityQuery.isLoading ? <LoadingSkeleton rows={5} /> : null}

          {!activityQuery.isLoading && activityQuery.data?.length === 0 ? (
            <div className="p-6 text-center text-sm text-dark-normal">
              No recent activity yet.
            </div>
          ) : null}

          {!activityQuery.isLoading && activityQuery.data && activityQuery.data.length > 0 ? (
            <ul className="divide-y divide-border">
              {activityQuery.data.map((activity) => (
                <li
                  key={`${activity.type}-${activity.id}`}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-[13px] font-medium text-dark-active">
                      {activity.referenceNumber}
                    </div>
                    <div className="text-[11px] text-dark-normal">{activity.warehouseName}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={activity.status} />
                    <span className="text-[10px] text-dark-light-active">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  )
}
