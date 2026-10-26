import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import formatPrice from '../../utils/formatPrice'
import { getOrders } from '../../api/orderApi'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader overline="Buyer area" title="Orders" description="Loading order history…" />
        <Skeleton count={3} />
      </main>
    )
  }

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Buyer area"
        title="Orders"
        description="Track current deliveries and view your order history."
      />

      {error ? <Message>{error}</Message> : null}

      {orders.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Status</th>
                <th className="table-number">Total</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId}>
                  <td data-label="Order">
                    <Link className="mono" to={`/orders/${order.orderId}`}>
                      #{order.orderId}
                    </Link>
                  </td>
                  <td data-label="Date" className="mono">
                    {order.orderDate}
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={order.status} />
                  </td>
                  <td data-label="Total" className="table-number mono">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td data-label="Payment">
                    <StatusBadge
                      status={order.paymentStatus}
                      label={order.paymentStatus === 'PENDING' ? 'Payment pending' : undefined}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          message="You have not placed any orders yet."
          action={
            <Link className="btn btn-primary btn-sm" to="/products">
              Explore catalog
            </Link>
          }
        />
      )}
    </main>
  )
}
