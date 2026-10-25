import { useEffect, useState } from 'react'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import { getSellerDashboard } from '../../api/sellerApi'

export default function SellerDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { getSellerDashboard().then(setStats).catch((requestError) => setError(requestError.message)) }, [])
  return <main className="page" id="main-content"><div className="page-header"><div><p className="overline">Seller area</p><h1 className="title-lg">Dashboard</h1></div></div>{error ? <Message>{error}</Message> : null}{stats ? <div className="dashboard-grid"><article className="card stat-card"><span className="caption">Products</span><strong className="stat-value">{stats.products}</strong></article><article className="card stat-card"><span className="caption">Pending sub-orders</span><strong className="stat-value">{stats.pendingSubOrders}</strong></article><article className="card stat-card"><span className="caption">Low-stock offers</span><strong className="stat-value">{stats.lowStockOffers}</strong></article></div> : <Skeleton count={3} />}</main>
}
