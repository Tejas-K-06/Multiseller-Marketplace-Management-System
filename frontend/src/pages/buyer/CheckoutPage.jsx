import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import formatPrice from '../../utils/formatPrice'
import { getCart } from '../../api/cartApi'
import { getAddresses } from '../../api/addressApi'
import { validateCoupon } from '../../api/couponApi'
import { checkout, payOrder } from '../../api/orderApi'

const paymentMethods = [
  ['COD', 'Cash on delivery'],
  ['UPI', 'UPI'],
  ['CARD', 'Card'],
  ['NETBANKING', 'Net banking']
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
  const codEligible = useMemo(() => cart?.items.every((item) => item.codEligible !== false) ?? true, [cart])
  const discount = coupon ? (coupon.discountType === 'PERCENT' ? Number((cart.estimatedTotal * coupon.discountValue / 100).toFixed(2)) : Math.min(cart.estimatedTotal, coupon.discountValue)) : 0
  const total = cart ? cart.estimatedTotal - discount : 0

  useEffect(() => {
    Promise.all([getCart(), getAddresses()]).then(([nextCart, nextAddresses]) => { setCart(nextCart); setAddresses(nextAddresses); setAddressId(String(nextAddresses.find((address) => address.isDefault)?.addressId || nextAddresses[0]?.addressId || '')) }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [])

  async function applyCoupon(event) {
    event.preventDefault()
    try { setCoupon(await validateCoupon(couponCode)); setError('') } catch (requestError) { setCoupon(null); setError(requestError.message) }
  }

  async function placeOrder(event) {
    event.preventDefault()
    if (!addressId) { setError('Choose a delivery address.'); return }
    if (paymentMethod === 'COD' && !codEligible) { setError('Cash on delivery is not available for every cart item.'); return }
    try { setPlaced(await checkout({ addressId: Number(addressId), couponCode: coupon?.code, paymentMethod })); setError('') } catch (requestError) { setError(requestError.message) }
  }

  async function pay(outcome = 'SUCCESS') {
    try {
      const result = await payOrder(placed.orderId, outcome)
      if (result.status === 'FAILED') setPaymentFailed(true)
      else navigate(`/orders/${placed.orderId}`)
    } catch (requestError) { setError(requestError.message) }
  }

  if (loading) return <main className="page" id="main-content"><Skeleton count={2} /></main>
  if (placed) return <main className="page" id="main-content"><section className="order-placed"><div className="card"><p className="overline">Order placed</p><h1 className="title-lg">Thank you for your order.</h1><p className="body">Your order number is <strong className="mono">#{placed.orderId}</strong>.</p><p className="mono">{formatPrice(placed.totalAmount)}</p>{paymentMethod === 'COD' ? <button className="btn btn-primary" type="button" onClick={() => navigate(`/orders/${placed.orderId}`)}>View order</button> : <div className="payment-failed">{paymentFailed ? <Message>Payment failed. You can retry the payment while the order is placed.</Message> : <p className="body">Complete the simulated payment for this online order.</p>}{paymentFailed ? <button className="btn btn-primary" type="button" onClick={() => { setPaymentFailed(false); pay('SUCCESS') }}>Retry payment</button> : <><button className="btn btn-primary" type="button" onClick={() => pay('SUCCESS')}>Pay now</button><button className="btn btn-secondary" type="button" onClick={() => pay('FAIL')}>Test failed payment</button></>}</div>}</div></section></main>

  return <main className="page" id="main-content"><div className="page-header"><div><p className="overline">Buyer area</p><h1 className="title-lg">Checkout</h1></div></div>{error ? <Message>{error}</Message> : null}<div className="stepper" aria-label="Checkout progress"><div className="step current"><span className="step-dot">1</span><span>Address</span></div><div className="step current"><span className="step-dot">2</span><span>Payment</span></div><div className="step"><span className="step-dot">3</span><span>Review</span></div></div><div className="two-column"><div className="content-stack"><section className="card detail-section" aria-labelledby="address-title"><h2 className="heading" id="address-title">Delivery address</h2>{addresses.map((address) => <label className={`select-row${String(address.addressId) === addressId ? ' selected' : ''}`} key={address.addressId}><input type="radio" name="address" checked={String(address.addressId) === addressId} onChange={() => setAddressId(String(address.addressId))} /><span>{address.line1}, {address.city}<br /><span className="caption">{address.state} · {address.postalCode}</span></span></label>)}</section><section className="card detail-section" aria-labelledby="payment-title"><h2 className="heading" id="payment-title">Payment method</h2>{paymentMethods.map(([value, label]) => <label className={`select-row${paymentMethod === value ? ' selected' : ''}`} key={value}><input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} disabled={value === 'COD' && !codEligible} onChange={(event) => setPaymentMethod(event.target.value)} /><span>{label}{value === 'COD' && !codEligible ? <small className="caption">Cash on delivery is unavailable for one or more offers.</small> : null}</span></label>)}</section><section className="card detail-section" aria-labelledby="coupon-title"><h2 className="heading" id="coupon-title">Coupon</h2><form className="inline-actions" onSubmit={applyCoupon}><input className="input" aria-label="Coupon code" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="WELCOME10" /><button className="btn btn-secondary" type="submit">Apply</button></form>{coupon ? <p className="small">Applied <span className="mono">{coupon.code}</span>: {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}% off` : `${formatPrice(coupon.discountValue)} off`}</p> : null}</section><form onSubmit={placeOrder}><button className="btn btn-primary" type="submit">Place order</button></form></div><aside className="card detail-section"><h2 className="heading">Order summary</h2><dl className="summary-list"><div><dt>Subtotal</dt><dd className="mono">{formatPrice(cart.estimatedTotal)}</dd></div><div><dt>Discount</dt><dd className="mono">−{formatPrice(discount)}</dd></div><div><dt>Total</dt><dd className="mono"><strong>{formatPrice(total)}</strong></dd></div></dl></aside></div></main>
}
