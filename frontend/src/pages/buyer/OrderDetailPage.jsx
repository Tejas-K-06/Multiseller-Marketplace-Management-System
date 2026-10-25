import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import FormField from '../../components/FormField'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import StatusBadge from '../../components/StatusBadge'
import formatPrice from '../../utils/formatPrice'
import { cancelOrder, getOrder } from '../../api/orderApi'
import { createReview } from '../../api/reviewApi'

const progress = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [reviewValues, setReviewValues] = useState({})
  const dialogRef = useRef(null)
  useEffect(() => { getOrder(id).then(setOrder).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)) }, [id])
  if (loading) return <main className="page" id="main-content"><Skeleton count={3} /></main>
  if (!order) return <main className="page" id="main-content"><Message>{error || 'Order not found.'}</Message></main>
  const canCancel = order.subOrders.every((subOrder) => subOrder.status === 'PENDING')
  const currentIndex = progress.indexOf(order.status)

  async function confirmCancel() {
    try { await cancelOrder(order.orderId); setOrder(await getOrder(order.orderId)); setError(''); dialogRef.current?.close() } catch (requestError) { setError(requestError.message) }
  }

  async function submitReview(event, productId) {
    event.preventDefault()
    const values = reviewValues[productId] || { rating: '5', comment: '' }
    try { await createReview({ orderId: order.orderId, productId, rating: Number(values.rating), comment: values.comment }); setOrder(await getOrder(order.orderId)); setError('') } catch (requestError) { setError(requestError.message) }
  }

  function updateReview(productId, name, value) { setReviewValues((current) => ({ ...current, [productId]: { ...(current[productId] || { rating: '5', comment: '' }), [name]: value } })) }

  return <main className="page" id="main-content"><div className="page-header"><div><p className="overline">Order detail</p><h1 className="title-lg">Order <span className="mono">#{order.orderId}</span></h1><p className="caption mono">{order.orderDate}</p></div><div className="inline-actions">{canCancel ? <button className="btn btn-secondary" type="button" onClick={() => dialogRef.current?.showModal()}>Cancel order</button> : null}<StatusBadge status={order.status} /></div></div>{error ? <Message>{error}</Message> : null}<dialog className="confirm-dialog" ref={dialogRef}><h2 className="heading">Cancel this order?</h2><p>Stock will be restored and the order will be marked cancelled.</p><div className="inline-actions"><button className="btn btn-ghost" type="button" onClick={() => dialogRef.current?.close()}>Keep order</button><button className="btn btn-secondary" type="button" onClick={confirmCancel}>Confirm cancellation</button></div></dialog><div className="content-stack"><section className="card detail-section" aria-labelledby="progress-title"><h2 className="heading" id="progress-title">Order progress</h2><div className="stepper" aria-label="Order progress">{progress.map((step, index) => <div className={`step ${index < currentIndex ? 'complete' : index === currentIndex ? 'current' : ''}`} key={step}><span className="step-dot">{index + 1}</span><span>{step[0] + step.slice(1).toLowerCase()}</span></div>)}</div></section><div className="two-column"><section className="content-stack"><section className="card detail-section" aria-labelledby="address-title"><h2 className="heading" id="address-title">Delivery address</h2><p>{order.address.line1}<br />{order.address.city}, {order.address.state} · {order.address.postalCode}</p></section>{order.subOrders.map((subOrder) => <section className="card detail-section" key={subOrder.subOrderId} aria-labelledby={`sub-order-${subOrder.subOrderId}`}><div className="inline-actions"><h2 className="heading" id={`sub-order-${subOrder.subOrderId}`}>{subOrder.storeName}</h2><StatusBadge status={subOrder.status} /></div>{subOrder.trackingNumber ? <p className="caption">Tracking number <span className="mono">{subOrder.trackingNumber}</span></p> : null}<div className="table-wrap"><table><thead><tr><th>Item</th><th>Quantity</th><th className="table-number">Unit price</th><th className="table-number">Line total</th></tr></thead><tbody>{subOrder.items.map((item) => <tr key={item.itemNumber}><td data-label="Item">{item.title}</td><td data-label="Quantity" className="mono">{item.quantity}</td><td data-label="Unit price" className="table-number mono">{formatPrice(item.unitPrice)}</td><td data-label="Line total" className="table-number mono">{formatPrice(item.lineTotal)}</td></tr>)}</tbody></table></div>{order.status === 'DELIVERED' ? subOrder.items.map((item) => item.reviewed ? null : <form className="card auth-form" key={`review-${item.productId}`} onSubmit={(event) => submitReview(event, item.productId)}><h3 className="heading">Write a review for {item.title}</h3><FormField label="Rating" id={`rating-${item.productId}`}><select className="input" id={`rating-${item.productId}`} value={reviewValues[item.productId]?.rating || '5'} onChange={(event) => updateReview(item.productId, 'rating', event.target.value)}><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Average</option><option value="2">2 — Poor</option><option value="1">1 — Very poor</option></select></FormField><FormField label="Comment" id={`comment-${item.productId}`}><textarea className="input" id={`comment-${item.productId}`} rows="3" value={reviewValues[item.productId]?.comment || ''} onChange={(event) => updateReview(item.productId, 'comment', event.target.value)} /></FormField><button className="btn btn-primary" type="submit">Submit review</button></form>) : null}</section>)}</section><aside className="card detail-section"><h2 className="heading">Payment</h2><p>{order.payment.method}</p><StatusBadge status={order.payment.status} label={order.payment.status === 'PENDING' ? 'Payment pending' : undefined} /><dl className="summary-list"><div><dt>Subtotal</dt><dd className="mono">{formatPrice(order.subtotal)}</dd></div><div><dt>Discount</dt><dd className="mono">−{formatPrice(order.discount)}</dd></div><div><dt>Total</dt><dd className="mono"><strong>{formatPrice(order.totalAmount)}</strong></dd></div></dl></aside></div></div></main>
}
