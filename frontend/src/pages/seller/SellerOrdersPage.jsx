import { useEffect, useState } from 'react'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import StatusBadge from '../../components/StatusBadge'
import formatPrice from '../../utils/formatPrice'
import { getSubOrders, updateSubOrderStatus } from '../../api/sellerApi'
import { useAuth } from '../../context/AuthContext'

const nextStatus = { PENDING: 'CONFIRMED', CONFIRMED: 'SHIPPED', SHIPPED: 'DELIVERED' }

export default function SellerOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { getSubOrders().then(setOrders).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)) }, [])
  async function move(order) { try { await updateSubOrderStatus(order.subOrderId, nextStatus[order.status]); setOrders(await getSubOrders()) } catch (requestError) { setError(requestError.message) } }
  const approved = user?.approvalStatus === 'APPROVED'
  if (loading) return <main className="page" id="main-content"><Skeleton count={2} /></main>
  return <main className="page" id="main-content"><div className="page-header"><div><p className="overline">Seller area</p><h1 className="title-lg">Sub-orders</h1></div></div>{!approved ? <Message>Your seller account is awaiting approval. Status actions are disabled.</Message> : null}{error ? <Message>{error}</Message> : null}{orders.length ? <div className="content-stack">{orders.map((order) => <section className="card detail-section" key={order.subOrderId}><div className="inline-actions"><div><h2 className="heading">Order <span className="mono">#{order.orderId}</span></h2><p className="caption">{order.buyerName} · {order.city} · {order.orderDate}</p></div><StatusBadge status={order.status} /></div><div className="table-wrap"><table><thead><tr><th>Item</th><th>Quantity</th><th className="table-number">Unit price</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.sku}><td data-label="Item">{item.title}<br /><span className="caption mono">{item.sku}</span></td><td data-label="Quantity" className="mono">{item.quantity}</td><td data-label="Unit price" className="table-number mono">{formatPrice(item.unitPrice)}</td></tr>)}</tbody></table></div><div className="inline-actions"><span>Seller payable <strong className="mono">{formatPrice(order.sellerPayable)}</strong></span>{order.trackingNumber ? <span className="caption">Tracking <span className="mono">{order.trackingNumber}</span></span> : null}{nextStatus[order.status] ? <button className="btn btn-primary" type="button" disabled={!approved} onClick={() => move(order)}>Mark {nextStatus[order.status].toLowerCase()}</button> : null}</div></section>)}</div> : <p>No sub-orders found.</p>}</main>
}
