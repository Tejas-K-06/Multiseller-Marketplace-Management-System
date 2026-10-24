import { mockClearCart, mockCartItems } from './cart'
import { mockProductDetails, mockProductReviews } from './products'
import { getMockAddresses } from './addresses'
import { mockValidateCoupon } from './coupons'

let nextOrderId = 3
let nextPaymentId = 3
let nextReviewId = 2

const orders = [
  {
    orderId: 1,
    orderDate: '2026-10-01',
    status: 'DELIVERED',
    address: { line1: '12 MG Road', city: 'Pune', state: 'Maharashtra', postalCode: '411001' },
    subtotal: 15997.00,
    discount: 1599.70,
    totalAmount: 14397.30,
    payment: { paymentId: 1, method: 'UPI', status: 'SUCCESS', paidAt: '2026-10-01 12:00:00' },
    subOrders: [
      { subOrderId: 1, storeName: 'TechHub', status: 'DELIVERED', trackingNumber: 'TRK1001', items: [{ itemNumber: 1, productId: 1, title: 'Nova X Smartphone', quantity: 1, unitPrice: 14999.00, lineTotal: 14999.00, reviewed: true }] },
      { subOrderId: 2, storeName: 'Fashionly', status: 'DELIVERED', trackingNumber: 'TRK1002', items: [{ itemNumber: 2, productId: 2, title: 'Cotton Round Neck T-Shirt', quantity: 2, unitPrice: 499.00, lineTotal: 998.00, reviewed: false }] }
    ]
  },
  {
    orderId: 2,
    orderDate: '2026-10-20',
    status: 'PLACED',
    address: { line1: '45 FC Road', city: 'Pune', state: 'Maharashtra', postalCode: '411004' },
    subtotal: 1999.00,
    discount: 0,
    totalAmount: 1999.00,
    payment: { paymentId: 2, method: 'COD', status: 'PENDING', paidAt: null },
    subOrders: [{ subOrderId: 3, storeName: 'TechHub', status: 'PENDING', trackingNumber: null, items: [{ itemNumber: 1, productId: 3, title: 'Wireless Earbuds', quantity: 1, unitPrice: 1999.00, lineTotal: 1999.00, reviewed: false }] }]
  }
]

function clone(value) { return JSON.parse(JSON.stringify(value)) }

function findOffer(offerId) {
  for (const product of mockProductDetails) for (const variant of product.variants) {
    const offer = variant.offers.find((item) => item.offerId === Number(offerId))
    if (offer) return { product, variant, offer }
  }
  return null
}

function summary(order) {
  return { orderId: order.orderId, orderDate: order.orderDate, status: order.status, totalAmount: order.totalAmount, paymentStatus: order.payment.status, itemCount: order.subOrders.flatMap((subOrder) => subOrder.items).reduce((count, item) => count + item.quantity, 0) }
}

export function getMockOrders() { return orders.map(summary) }
export function getMockOrder(orderId) { return clone(orders.find((order) => order.orderId === Number(orderId))) }

function discountFor(coupon, subtotal) {
  if (!coupon) return 0
  return coupon.discountType === 'PERCENT' ? Number((subtotal * coupon.discountValue / 100).toFixed(2)) : Math.min(subtotal, coupon.discountValue)
}

export function mockCheckout({ addressId, couponCode, paymentMethod }) {
  const cart = mockCartItems()
  if (!cart.length) throw new Error('Your cart is empty')
  const address = getMockAddresses().find((item) => item.addressId === Number(addressId))
  if (!address) throw new Error('Choose a valid address')
  const coupon = couponCode ? mockValidateCoupon(couponCode) : null
  const grouped = new Map()
  for (const item of cart) {
    const found = findOffer(item.offerId)
    if (!found || item.quantity > found.offer.stockQuantity) throw new Error(`Insufficient stock for '${item.title}'`)
    if (paymentMethod === 'COD' && !found.offer.codEligible) throw new Error('Cash on delivery is not available for every cart item')
    found.offer.stockQuantity -= item.quantity
    if (!grouped.has(found.offer.sellerId)) grouped.set(found.offer.sellerId, { storeName: found.product.storeName, items: [] })
    grouped.get(found.offer.sellerId).items.push({ item, found })
  }
  const subtotal = cart.reduce((total, item) => total + item.lineTotal, 0)
  const discount = discountFor(coupon, subtotal)
  const orderId = nextOrderId++
  const paymentId = nextPaymentId++
  let itemNumber = 1
  const subOrders = Array.from(grouped.values()).map((group, index) => ({ subOrderId: 4 + index, storeName: group.storeName, status: 'PENDING', trackingNumber: null, items: group.items.map(({ item, found }) => ({ itemNumber: itemNumber++, productId: found.product.productId, title: found.product.title, quantity: item.quantity, unitPrice: item.price, lineTotal: item.lineTotal, reviewed: false })) }))
  const order = { orderId, orderDate: '2026-10-25', status: 'PLACED', address: { line1: address.line1, city: address.city, state: address.state, postalCode: address.postalCode }, subtotal, discount, totalAmount: subtotal - discount, payment: { paymentId, method: paymentMethod, status: 'PENDING', paidAt: null }, subOrders }
  orders.push(order)
  mockClearCart()
  return { orderId, subtotal, discount, totalAmount: order.totalAmount, paymentId, paymentStatus: 'PENDING' }
}

export function mockCancelOrder(orderId) {
  const order = orders.find((item) => item.orderId === Number(orderId))
  if (!order || order.subOrders.some((subOrder) => subOrder.status !== 'PENDING')) throw new Error('Only orders with pending sub-orders can be cancelled')
  order.status = 'CANCELLED'
  order.subOrders.forEach((subOrder) => { subOrder.status = 'CANCELLED' })
  if (order.payment.method !== 'COD') order.payment.status = 'REFUNDED'
  return { orderId: order.orderId, status: order.status }
}

export function mockPayOrder(orderId, outcome = 'SUCCESS') {
  const order = orders.find((item) => item.orderId === Number(orderId))
  if (!order || order.payment.method === 'COD' || order.payment.status === 'SUCCESS') throw new Error('This order cannot be paid')
  order.payment.status = outcome === 'FAIL' ? 'FAILED' : 'SUCCESS'
  order.payment.paidAt = outcome === 'FAIL' ? null : '2026-10-25 12:00:00'
  return { paymentId: order.payment.paymentId, status: order.payment.status, paidAt: order.payment.paidAt }
}

export function mockCreateReview({ orderId, productId, rating, comment }) {
  const order = orders.find((item) => item.orderId === Number(orderId))
  if (!order || order.status !== 'DELIVERED') throw new Error('Reviews are available after delivery')
  const item = order.subOrders.flatMap((subOrder) => subOrder.items).find((entry) => entry.productId === Number(productId))
  if (!item || item.reviewed) throw new Error('This product has already been reviewed')
  item.reviewed = true
  const review = { reviewId: nextReviewId++, buyerName: 'Rahul Patil', rating: Number(rating), comment: comment || '', isVerifiedPurchase: true }
  mockProductReviews[productId] = [...(mockProductReviews[productId] || []), review]
  return { reviewId: review.reviewId }
}
