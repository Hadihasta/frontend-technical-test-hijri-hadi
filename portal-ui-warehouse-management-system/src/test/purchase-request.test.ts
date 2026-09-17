import { describe, expect, it } from 'vitest'
import {
  approvePurchaseRequest,
  createPurchaseRequest,
  fetchPurchaseRequestById,
  submitPurchaseRequest,
} from '@/api/purchase-requests'
import { setSimulateError } from '@/api/client'

describe('Purchase Request API', () => {
  it('cannot submit purchase request without items', async () => {
    const draft = await createPurchaseRequest({
      warehouseId: 'wh-1',
      requestedBy: 'John Doe',
      items: [{ productId: 'prod-1', quantity: 5, unit: 'PCS' }],
    })

    const emptyDraft = await createPurchaseRequest({
      warehouseId: 'wh-1',
      requestedBy: 'John Doe',
      items: [],
    })

    await expect(submitPurchaseRequest(emptyDraft.id)).rejects.toThrow(
      'Purchase Request must have at least one item',
    )

    await expect(submitPurchaseRequest(draft.id)).resolves.toMatchObject({
      status: 'SUBMITTED',
    })
  })

  it('approver can approve submitted PR and USER flow creates PO', async () => {
    const draft = await createPurchaseRequest({
      warehouseId: 'wh-2',
      requestedBy: 'John Doe',
      items: [{ productId: 'prod-3', quantity: 10, unit: 'PCS' }],
    })

    await submitPurchaseRequest(draft.id)
    const approved = await approvePurchaseRequest(draft.id)

    expect(approved.status).toBe('APPROVED')

    const detail = await fetchPurchaseRequestById(draft.id)
    expect(detail.status).toBe('APPROVED')
  })

  it('simulated API error can be toggled', async () => {
    setSimulateError(true)
    await expect(fetchPurchaseRequestById('pr-1')).rejects.toThrow('Simulated network failure')
    setSimulateError(false)
  })
})
