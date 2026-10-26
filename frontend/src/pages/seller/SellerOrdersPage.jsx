import { useEffect, useState } from 'react'
import EmptyState from '../../components/EmptyState'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import formatPrice from '../../utils/formatPrice'
import { getSubOrders, updateSubOrderStatus } from '../../api/sellerApi'
import { useAuth } from '../../context/AuthContext'

const nextStatus = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'SHIPPED',
  SHIPPED: 'DELIVERED'
}

export default function SellerOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    getSubOrders()
      .then(setOrders)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  async function move(order) {
    const targetStatus = nextStatus[order.status]
    if (!targetStatus) return

    setUpdating(order.subOrderId)
    try {
      await updateSubOrderStatus(order.subOrderId, targetStatus)
      const refreshed = await getSubOrders()
      setOrders(refreshed)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdating(null)
    }
  }

  const approved = user?.approvalStatus === 'APPROVED'

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader overline="Seller area" title="Sub-orders" description="Loading fulfilment orders…" />
        <Skeleton count={2} />
      </main>
    )
  }

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Seller area"
        title="Sub-orders"
        description="Review buyer orders and advance items through fulfilment steps."
      />

      {!approved ? (
        <Message>
          Your seller account is pending admin approval. Order status updates are currently disabled.
        </Message>
      ) : null}

      {error ? <Message>{error}</Message> : null}

      {orders.length ? (
        <div className="content-stack">
          {orders.map((order) => (
            <SectionCard
              key={order.subOrderId}
              title={
                <span>
                  Order <span className="mono">#{order.orderId}</span>
                </span>
              }
              description={`Buyer: ${order.buyerName} · Destination: ${order.city} · Date: ${order.orderDate}`}
              action={<StatusBadge status={order.status} />}
            >
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Item title</th>
                      <th>SKU</th>
                      <th className="table-number">Quantity</th>
                      <th className="table-number">Unit price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.sku}>
                        <td data-label="Item title">
                          <strong>{item.title}</strong>
                        </td>
                        <td data-label="SKU" className="mono">
                          {item.sku}
                        </td>
                        <td data-label="Quantity" className="table-number mono">
                          {item.quantity}
                        </td>
                        <td data-label="Unit price" className="table-number mono">
                          {formatPrice(item.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                className="inline-actions"
                style={{
                  paddingTop: 'var(--space-2)',
                  borderTop: '1px solid var(--subtle)',
                  marginTop: 'var(--space-2)'
                }}
              >
                <div>
                  <span className="small">
                    Seller payable:{' '}
                    <strong className="mono price" style={{ fontSize: '1rem' }}>
                      {formatPrice(order.sellerPayable)}
                    </strong>
                  </span>
                  {order.trackingNumber ? (
                    <p className="caption" style={{ margin: 'var(--space-1) 0 0' }}>
                      Tracking: <strong className="mono">{order.trackingNumber}</strong>
                    </p>
                  ) : null}
                </div>

                {nextStatus[order.status] ? (
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    disabled={!approved || updating === order.subOrderId}
                    onClick={() => move(order)}
                  >
                    {updating === order.subOrderId
                      ? 'Updating…'
                      : `Mark ${nextStatus[order.status].toLowerCase()}`}
                  </button>
                ) : (
                  <span className="caption">Fulfilment complete</span>
                )}
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState message="No sub-orders assigned to your store." />
      )}
    </main>
  )
}
