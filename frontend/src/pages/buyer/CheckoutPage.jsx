import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import formatPrice from '../../utils/formatPrice'
import { getCart } from '../../api/cartApi'
import { getAddresses } from '../../api/addressApi'
import { validateCoupon } from '../../api/couponApi'
import { checkout, payOrder } from '../../api/orderApi'

const paymentMethods = [
  ['UPI', 'UPI Payment'],
  ['CARD', 'Credit / Debit Card'],
  ['NETBANKING', 'Net Banking'],
  ['COD', 'Cash on Delivery']
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [placed, setPlaced] = useState(null)
  const [paymentFailed, setPaymentFailed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [couponApplying, setCouponApplying] = useState(false)
  const [paying, setPaying] = useState(false)

  const codEligible = useMemo(
    () => cart?.items.every((item) => item.codEligible !== false) ?? true,
    [cart]
  )

  const discount = coupon
    ? coupon.discountType === 'PERCENT'
      ? Number(((cart.estimatedTotal * coupon.discountValue) / 100).toFixed(2))
      : Math.min(cart.estimatedTotal, coupon.discountValue)
    : 0

  const total = cart ? Math.max(0, cart.estimatedTotal - discount) : 0

  useEffect(() => {
    Promise.all([getCart(), getAddresses()])
      .then(([nextCart, nextAddresses]) => {
        setCart(nextCart)
        setAddresses(nextAddresses)
        const def = nextAddresses.find((a) => a.isDefault) || nextAddresses[0]
        setAddressId(String(def?.addressId || ''))
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  async function applyCoupon(event) {
    event.preventDefault()
    if (!couponCode.trim()) return
    setCouponApplying(true)
    try {
      const valid = await validateCoupon(couponCode.trim())
      setCoupon(valid)
      setError('')
    } catch (requestError) {
      setCoupon(null)
      setError(requestError.message)
    } finally {
      setCouponApplying(false)
    }
  }

  async function placeOrder(event) {
    event.preventDefault()
    if (!addressId) {
      setError('Please select a delivery address before placing order.')
      return
    }
    if (paymentMethod === 'COD' && !codEligible) {
      setError('Cash on delivery is not eligible for one or more items in your cart.')
      return
    }
    setSubmitting(true)
    try {
      const order = await checkout({
        addressId: Number(addressId),
        couponCode: coupon?.code,
        paymentMethod
      })
      setPlaced(order)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function pay(outcome = 'SUCCESS') {
    setPaying(true)
    try {
      const result = await payOrder(placed.orderId, outcome)
      if (result.status === 'FAILED') {
        setPaymentFailed(true)
      } else {
        navigate(`/orders/${placed.orderId}`)
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader overline="Buyer area" title="Checkout" description="Loading order details…" />
        <Skeleton count={2} />
      </main>
    )
  }

  if (placed) {
    return (
      <main className="page" id="main-content">
        <PageHeader
          overline="Order placed"
          title="Thank you for your order."
          description={`Order #${placed.orderId} has been created.`}
        />

        <section className="order-placed" aria-labelledby="order-placed-heading">
          <div className="card">
            <h2 className="heading" id="order-placed-heading">
              Order amount: <span className="mono">{formatPrice(placed.totalAmount)}</span>
            </h2>

            {paymentMethod === 'COD' ? (
              <>
                <p className="body">
                  Your order is placed with Cash on Delivery. Pay at delivery.
                </p>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => navigate(`/orders/${placed.orderId}`)}
                >
                  View order details
                </button>
              </>
            ) : (
              <div className="payment-failed">
                {paymentFailed ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
                      <StatusBadge status="FAILED" />
                    </div>
                    <Message>
                      Payment simulation failed. Your order remains placed and you can retry now.
                    </Message>
                    <button
                      className="btn btn-primary"
                      type="button"
                      disabled={paying}
                      onClick={() => {
                        setPaymentFailed(false)
                        pay('SUCCESS')
                      }}
                    >
                      {paying ? 'Retrying payment…' : 'Retry payment'}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="body">Complete payment simulation to proceed.</p>
                    <div className="inline-actions" style={{ justifyContent: 'center' }}>
                      <button
                        className="btn btn-primary"
                        type="button"
                        disabled={paying}
                        onClick={() => pay('SUCCESS')}
                      >
                        {paying ? 'Processing…' : 'Pay now (Success)'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        disabled={paying}
                        onClick={() => pay('FAIL')}
                      >
                        Simulate failed payment
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Buyer area"
        title="Checkout"
        description="Select delivery address and payment method to finalize order."
      />

      {error ? <Message>{error}</Message> : null}

      {/* Stepper per DESIGN.md section 5 */}
      <div className="stepper" aria-label="Checkout progress">
        <div className="step complete">
          <span className="step-dot">1</span>
          <span>Address</span>
        </div>
        <div className="step current">
          <span className="step-dot">2</span>
          <span>Payment</span>
        </div>
        <div className="step">
          <span className="step-dot">3</span>
          <span>Review</span>
        </div>
      </div>

      <div className="two-column">
        <div className="content-stack">
          {/* Address Choice */}
          <section className="card detail-section" aria-labelledby="address-heading">
            <div className="inline-actions">
              <h2 className="heading" id="address-heading">
                Delivery address
              </h2>
              <Link className="small" to="/addresses">
                Manage addresses
              </Link>
            </div>

            {addresses.length === 0 ? (
              <p className="caption">
                No saved address.{' '}
                <Link to="/addresses">Add a delivery address</Link> first.
              </p>
            ) : (
              <div role="radiogroup" aria-label="Delivery addresses">
                {addresses.map((address) => {
                  const isSelected = String(address.addressId) === addressId
                  return (
                    <label
                      key={address.addressId}
                      className={`select-row${isSelected ? ' selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={isSelected}
                        onChange={() => setAddressId(String(address.addressId))}
                      />
                      <span>
                        <strong>{address.line1}</strong>, {address.city}
                        <br />
                        <span className="caption">
                          {address.state} · {address.postalCode}
                          {address.isDefault ? ' (Default)' : ''}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </section>

          {/* Payment Method Choice */}
          <section className="card detail-section" aria-labelledby="payment-heading">
            <h2 className="heading" id="payment-heading">
              Payment method
            </h2>

            <div role="radiogroup" aria-label="Payment method">
              {paymentMethods.map(([value, label]) => {
                const isSelected = paymentMethod === value
                const isCodDisabled = value === 'COD' && !codEligible
                return (
                  <label
                    key={value}
                    className={`select-row${isSelected ? ' selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={isSelected}
                      disabled={isCodDisabled}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>
                      <strong>{label}</strong>
                      {isCodDisabled ? (
                        <span className="caption" style={{ display: 'block' }}>
                          Cash on delivery unavailable for some items in cart.
                        </span>
                      ) : null}
                    </span>
                  </label>
                )
              })}
            </div>
          </section>

          {/* Coupon Code */}
          <section className="card detail-section" aria-labelledby="coupon-heading">
            <h2 className="heading" id="coupon-heading">
              Have a coupon?
            </h2>
            <form className="inline-actions" onSubmit={applyCoupon}>
              <input
                className="input mono"
                aria-label="Coupon code"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Enter coupon code"
              />
              <button
                className="btn btn-secondary"
                type="submit"
                disabled={couponApplying || !couponCode.trim()}
              >
                {couponApplying ? 'Applying…' : 'Apply coupon'}
              </button>
            </form>

            {coupon ? (
              <p className="small">
                Coupon applied: <strong className="mono">{coupon.code}</strong> (
                {coupon.discountType === 'PERCENT'
                  ? `${coupon.discountValue}% off`
                  : `${formatPrice(coupon.discountValue)} off`}
                )
              </p>
            ) : null}
          </section>

          <form onSubmit={placeOrder}>
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={submitting || !cart || cart.items.length === 0}
              style={{ width: '100%' }}
            >
              {submitting ? 'Placing order…' : 'Place order'}
            </button>
          </form>
        </div>

        {/* Order Summary Side Panel */}
        <aside className="card detail-section" aria-labelledby="order-summary-heading">
          <h2 className="heading" id="order-summary-heading">
            Order summary
          </h2>

          <dl className="summary-list">
            <div>
              <dt>Subtotal</dt>
              <dd className="mono">{formatPrice(cart?.estimatedTotal || 0)}</dd>
            </div>
            {discount > 0 ? (
              <div>
                <dt>Discount</dt>
                <dd className="mono">−{formatPrice(discount)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Total payable</dt>
              <dd className="mono">
                <strong className="price" style={{ fontSize: '1.25rem' }}>
                  {formatPrice(total)}
                </strong>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </main>
  )
}
