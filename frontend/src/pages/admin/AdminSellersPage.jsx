import { useEffect, useState } from 'react'
import EmptyState from '../../components/EmptyState'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { getSellers, setSellerApproval } from '../../api/adminApi'

const statusOptions = [
  { label: 'All sellers', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' }
]

export default function AdminSellersPage() {
  const [status, setStatus] = useState('')
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    setLoading(true)
    getSellers(status)
      .then(setSellers)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [status])

  async function update(sellerId, approvalStatus) {
    setUpdating(sellerId)
    try {
      await setSellerApproval(sellerId, approvalStatus)
      const refreshed = await getSellers(status)
      setSellers(refreshed)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Admin area"
        title="Seller approvals"
        description="Review seller merchant applications and manage store access."
      />

      {error ? <Message>{error}</Message> : null}

      {/* Status filter as chips per Task 6 */}
      <div className="filter-bar">
        <span className="field-label">Filter by approval status</span>
        <div className="chip-list" role="radiogroup" aria-label="Seller approval status filter">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              className="chip"
              type="button"
              role="radio"
              aria-checked={status === opt.value}
              aria-pressed={status === opt.value}
              onClick={() => setStatus(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton count={3} />
      ) : sellers.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Store name</th>
                <th>Contact email</th>
                <th>Tax ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller.userId}>
                  <td data-label="Store name">
                    <strong>{seller.storeName}</strong>
                  </td>
                  <td data-label="Contact email">
                    <span className="small">{seller.email}</span>
                  </td>
                  <td data-label="Tax ID" className="mono">
                    {seller.taxId || '—'}
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={seller.approvalStatus} />
                  </td>
                  <td data-label="Actions">
                    <div className="form-actions">
                      {seller.approvalStatus !== 'APPROVED' ? (
                        <button
                          className="btn btn-primary btn-sm"
                          type="button"
                          disabled={updating === seller.userId}
                          onClick={() => update(seller.userId, 'APPROVED')}
                        >
                          {updating === seller.userId ? 'Updating…' : 'Approve'}
                        </button>
                      ) : null}
                      {seller.approvalStatus !== 'REJECTED' ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          type="button"
                          disabled={updating === seller.userId}
                          onClick={() => update(seller.userId, 'REJECTED')}
                        >
                          {updating === seller.userId ? 'Updating…' : 'Reject'}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="No sellers match the selected filter." />
      )}
    </main>
  )
}
