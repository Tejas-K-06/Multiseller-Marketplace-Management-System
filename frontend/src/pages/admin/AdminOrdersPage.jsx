import { useEffect, useState } from 'react'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import StatusBadge from '../../components/StatusBadge'
import formatPrice from '../../utils/formatPrice'
import { getAdminOrders, getAdminStats } from '../../api/adminApi'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { Promise.all([getAdminOrders(), getAdminStats()]).then(([nextOrders, nextStats]) => { setOrders(nextOrders); setStats(nextStats) }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)) }, [])
  if (loading) return <main className="page" id="main-content"><Skeleton count={3} /></main>
  return <main className="page" id="main-content"><div className="page-header"><div><p className="overline">Admin area</p><h1 className="title-lg">Orders and stats</h1></div></div>{error ? <Message>{error}</Message> : null}{stats ? <div className="dashboard-grid"><article className="card stat-card"><span className="caption">Users</span><strong className="stat-value">{stats.users}</strong></article><article className="card stat-card"><span className="caption">Sellers</span><strong className="stat-value">{stats.sellers}</strong></article><article className="card stat-card"><span className="caption">Products</span><strong className="stat-value">{stats.products}</strong></article><article className="card stat-card"><span className="caption">Orders</span><strong className="stat-value">{stats.orders}</strong></article><article className="card stat-card"><span className="caption">Revenue</span><strong className="stat-value">{formatPrice(stats.revenue)}</strong></article></div> : null}<section className="card detail-section" aria-labelledby="all-orders"><h2 className="heading" id="all-orders">All orders</h2><div className="table-wrap"><table><thead><tr><th>Order</th><th>Buyer</th><th>Date</th><th>Status</th><th className="table-number">Total</th></tr></thead><tbody>{orders.map((order) => <tr key={order.orderId}><td data-label="Order" className="mono">#{order.orderId}</td><td data-label="Buyer">{order.buyerName}</td><td data-label="Date" className="mono">{order.orderDate}</td><td data-label="Status"><StatusBadge status={order.status} /></td><td data-label="Total" className="table-number mono">{formatPrice(order.totalAmount)}</td></tr>)}</tbody></table></div></section></main>
}
