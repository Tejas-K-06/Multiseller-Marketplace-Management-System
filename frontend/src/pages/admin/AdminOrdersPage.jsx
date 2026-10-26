import { useEffect, useState } from 'react'
import EmptyState from '../../components/EmptyState'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import formatPrice from '../../utils/formatPrice'
import { getAdminOrders, getAdminStats } from '../../api/adminApi'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAdminOrders(), getAdminStats()])
      .then(([nextOrders, nextStats]) => {
        setOrders(nextOrders)
        setStats(nextStats)
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader overline="Admin area" title="Marketplace orders & stats" description="Loading metrics…" />
        <Skeleton count={3} />
      </main>
    )
  }

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Admin area"
        title="Marketplace orders & stats"
        description="Monitor system-wide transaction volume, marketplace orders, and total revenue."
      />

      {error ? <Message>{error}</Message> : null}

      {/* Stats as StatCards in responsive grid above table per Task 6 */}
      {stats ? (
        <div className="dashboard-grid">
          <StatCard label="Registered users" value={stats.users} detail="Buyers and sellers" />
          <StatCard label="Active sellers" value={stats.sellers} detail="Merchant stores" />
          <StatCard label="Catalog products" value={stats.products} detail="Total listings" />
          <StatCard label="Total orders" value={stats.orders} detail="All-time orders" />
          <StatCard
            label="Gross revenue"
            value={formatPrice(stats.revenue)}
            detail="Processed marketplace GMV"
          />
        </div>
      ) : null}

      {/* Orders Table styled matching seller pages */}
      <SectionCard
        title="All marketplace orders"
        description={`${orders.length} ${
          orders.length === 1 ? 'order' : 'orders'
        } recorded in database`}
      >
        {orders.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Buyer</th>
                  <th>Order date</th>
                  <th>Status</th>
                  <th className="table-number">Total amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td data-label="Order" className="mono">
                      <strong>#{order.orderId}</strong>
                    </td>
                    <td data-label="Buyer">
                      <span className="small">{order.buyerName}</span>
                    </td>
                    <td data-label="Order date" className="mono">
                      {order.orderDate}
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={order.status} />
                    </td>
                    <td data-label="Total amount" className="table-number mono">
                      {formatPrice(order.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No orders recorded yet." />
        )}
      </SectionCard>
    </main>
  )
}
