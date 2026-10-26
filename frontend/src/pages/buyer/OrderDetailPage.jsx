import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumb from '../../components/Breadcrumb'
import ConfirmDialog from '../../components/ConfirmDialog'
import FormField from '../../components/FormField'
import Message from '../../components/Message'
import PageHeader from '../../components/PageHeader'
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [reviewing, setReviewing] = useState(null)

  useEffect(() => {
    getOrder(id)
      .then(setOrder)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader overline="Order details" title="Loading order…" />
        <Skeleton count={3} />
      </main>
    )
  }

  if (!order) {
    return (
      <main className="page" id="main-content">
        <PageHeader overline="Order details" title="Order unavailable" />
        <Message>{error || 'Order could not be found.'}</Message>
      </main>
    )
  }

  const canCancel = order.status !== 'CANCELLED' && order.subOrders.every((subOrder) => subOrder.status === 'PENDING')
  const currentIndex = progress.indexOf(order.status)

  async function confirmCancel() {
    setCancelling(true)
    try {
      await cancelOrder(order.orderId)
      const refreshed = await getOrder(order.orderId)
      setOrder(refreshed)
      setError('')
      setConfirmOpen(false)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setCancelling(false)
    }
  }

  async function submitReview(event, productId) {
    event.preventDefault()
    const values = reviewValues[productId] || { rating: '5', comment: '' }
    setReviewing(productId)
    try {
      await createReview({
        orderId: order.orderId,
        productId,
        rating: Number(values.rating),
        comment: values.comment
      })
      const refreshed = await getOrder(order.orderId)
      setOrder(refreshed)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setReviewing(null)
    }
  }

  function updateReview(productId, name, value) {
    setReviewValues((current) => ({
      ...current,
      [productId]: {
        ...(current[productId] || { rating: '5', comment: '' }),
        [name]: value
      }
    }))
  }

  return (
    <main className="page" id="main-content">
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Orders', to: '/orders' },
          { label: `Order #${order.orderId}` }
        ]}
      />

      <PageHeader
        overline="Order details"
        title={
          <span>
            Order <span className="mono">#{order.orderId}</span>
          </span>
        }
        description={`Placed on ${order.orderDate}`}
        action={
          <div className="inline-actions">
            {canCancel ? (
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => setConfirmOpen(true)}
              >
                Cancel order
              </button>
            ) : null}
            <StatusBadge status={order.status} />
          </div>
        }
      />

      {error ? <Message>{error}</Message> : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this order?"
        description="Stock will be restored and this order will be marked as cancelled."
        confirmLabel={cancelling ? 'Cancelling…' : 'Confirm cancellation'}
        onConfirm={confirmCancel}
        onClose={() => setConfirmOpen(false)}
      />

      <div className="content-stack">
        {/* Horizontal Progress Stepper */}
        {order.status !== 'CANCELLED' ? (
          <section className="card detail-section" aria-labelledby="progress-heading">
            <h2 className="heading" id="progress-heading">
              Order progress
            </h2>
            <div className="stepper" aria-label="Order progress">
              {progress.map((step, index) => {
                const isComplete = index < currentIndex
                const isCurrent = index === currentIndex
                return (
                  <div
                    key={step}
                    className={`step${isComplete ? ' complete' : isCurrent ? ' current' : ''}`}
                  >
                    <span className="step-dot">{index + 1}</span>
                    <span>{step[0] + step.slice(1).toLowerCase()}</span>
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        <div className="two-column">
          <div className="content-stack">
            {/* Delivery address */}
            <section className="card detail-section" aria-labelledby="shipping-address-heading">
              <h2 className="heading" id="shipping-address-heading">
                Delivery address
              </h2>
              <p className="body">
                {order.address.line1}
                <br />
                {order.address.city}, {order.address.state} ·{' '}
                <span className="mono">{order.address.postalCode}</span>
              </p>
            </section>

            {/* Store sub-orders */}
            {order.subOrders.map((subOrder) => (
              <section
                className="card detail-section"
                key={subOrder.subOrderId}
                aria-labelledby={`suborder-heading-${subOrder.subOrderId}`}
              >
                <div className="inline-actions">
                  <div>
                    <h2 className="heading" id={`suborder-heading-${subOrder.subOrderId}`}>
                      Fulfilled by {subOrder.storeName}
                    </h2>
                    {subOrder.trackingNumber ? (
                      <p className="caption">
                        Tracking number: <strong className="mono">{subOrder.trackingNumber}</strong>
                      </p>
                    ) : null}
                  </div>
                  <StatusBadge status={subOrder.status} />
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th className="table-number">Unit price</th>
                        <th className="table-number">Line total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subOrder.items.map((item) => (
                        <tr key={item.itemNumber || item.productId}>
                          <td data-label="Item">
                            <strong>{item.title}</strong>
                          </td>
                          <td data-label="Quantity" className="mono">
                            {item.quantity}
                          </td>
                          <td data-label="Unit price" className="table-number mono">
                            {formatPrice(item.unitPrice)}
                          </td>
                          <td data-label="Line total" className="table-number mono">
                            {formatPrice(item.lineTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Reviews if delivered */}
                {order.status === 'DELIVERED' ? (
                  subOrder.items.map((item) =>
                    item.reviewed ? null : (
                      <form
                        className="card auth-form"
                        key={`review-${item.productId}`}
                        onSubmit={(event) => submitReview(event, item.productId)}
                        style={{ marginTop: 'var(--space-3)' }}
                      >
                        <h3 className="subheading">Write a review for {item.title}</h3>
                        <FormField label="Rating" id={`rating-${item.productId}`}>
                          <select
                            className="input"
                            id={`rating-${item.productId}`}
                            value={reviewValues[item.productId]?.rating || '5'}
                            onChange={(event) =>
                              updateReview(item.productId, 'rating', event.target.value)
                            }
                          >
                            <option value="5">5 — Excellent</option>
                            <option value="4">4 — Good</option>
                            <option value="3">3 — Average</option>
                            <option value="2">2 — Poor</option>
                            <option value="1">1 — Very poor</option>
                          </select>
                        </FormField>
                        <FormField label="Review comment" id={`comment-${item.productId}`}>
                          <textarea
                            className="input"
                            id={`comment-${item.productId}`}
                            rows="3"
                            value={reviewValues[item.productId]?.comment || ''}
                            onChange={(event) =>
                              updateReview(item.productId, 'comment', event.target.value)
                            }
                            placeholder="Share your experience with this product…"
                          />
                        </FormField>
                        <button
                          className="btn btn-secondary btn-sm"
                          type="submit"
                          disabled={reviewing === item.productId}
                        >
                          {reviewing === item.productId ? 'Submitting…' : 'Submit review'}
                        </button>
                      </form>
                    )
                  )
                ) : null}
              </section>
            ))}
          </div>

          {/* Payment & Summary Side Panel */}
          <aside className="card detail-section" aria-labelledby="order-payment-heading">
            <h2 className="heading" id="order-payment-heading">
              Payment & charges
            </h2>
            <div className="inline-actions">
              <span>Method: <strong>{order.payment.method}</strong></span>
              <StatusBadge
                status={order.payment.status}
                label={order.payment.status === 'PENDING' ? 'Payment pending' : undefined}
              />
            </div>

            <dl className="summary-list">
              <div>
                <dt>Subtotal</dt>
                <dd className="mono">{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount > 0 ? (
                <div>
                  <dt>Discount</dt>
                  <dd className="mono">−{formatPrice(order.discount)}</dd>
                </div>
              ) : null}
              <div>
                <dt>Total</dt>
                <dd className="mono">
                  <strong className="price" style={{ fontSize: '1.25rem' }}>
                    {formatPrice(order.totalAmount)}
                  </strong>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </main>
  )
}
