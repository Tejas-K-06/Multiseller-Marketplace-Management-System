let products = [
  { productId: 1, sellerId: 2, categoryId: 3, title: 'Nova X Smartphone', description: '6.5 inch display, 5000 mAh battery', status: 'ACTIVE', variants: [{ variantId: 1, sku: 'NOVA-128-BLK', size: '128GB', colour: 'Black', weightKg: 0.18, offers: [{ offerId: 1, price: 14999.00, stockQuantity: 25, status: 'ACTIVE', codEligible: true }] }, { variantId: 2, sku: 'NOVA-256-BLU', size: '256GB', colour: 'Blue', weightKg: 0.19, offers: [{ offerId: 2, price: 17999.00, stockQuantity: 15, status: 'ACTIVE', codEligible: true }] }] },
  { productId: 2, sellerId: 3, categoryId: 4, title: 'Cotton Round Neck T-Shirt', description: '100% cotton, regular fit', status: 'ACTIVE', variants: [{ variantId: 3, sku: 'TSH-M-RED', size: 'M', colour: 'Red', weightKg: 0.2, offers: [{ offerId: 3, price: 499.00, stockQuantity: 100, status: 'ACTIVE', codEligible: true }] }, { variantId: 4, sku: 'TSH-L-BLK', size: 'L', colour: 'Black', weightKg: 0.21, offers: [{ offerId: 4, price: 499.00, stockQuantity: 80, status: 'ACTIVE', codEligible: true }] }] },
  { productId: 3, sellerId: 2, categoryId: 1, title: 'Wireless Earbuds', description: 'Bluetooth 5.3, 20 hour battery', status: 'ACTIVE', variants: [{ variantId: 5, sku: 'EAR-STD-WHT', size: 'Standard', colour: 'White', weightKg: 0.05, offers: [{ offerId: 5, price: 1999.00, stockQuantity: 50, status: 'ACTIVE', codEligible: true }] }] }
]

let subOrders = [
  { subOrderId: 1, orderId: 1, status: 'DELIVERED', buyerName: 'Rahul Patil', city: 'Pune', sellerPayable: 14999.00, orderDate: '2026-10-01', items: [{ title: 'Nova X Smartphone', sku: 'NOVA-128-BLK', quantity: 1, unitPrice: 14999.00 }], trackingNumber: 'TRK1001' },
  { subOrderId: 3, orderId: 2, status: 'PENDING', buyerName: 'Sneha Joshi', city: 'Pune', sellerPayable: 1999.00, orderDate: '2026-10-20', items: [{ title: 'Wireless Earbuds', sku: 'EAR-STD-WHT', quantity: 1, unitPrice: 1999.00 }], trackingNumber: null }
]

let nextProductId = 4
let nextVariantId = 6
let nextOfferId = 6

function clone(value) { return JSON.parse(JSON.stringify(value)) }

export function getMockSellerProducts(sellerId = 2) { return clone(products.filter((product) => product.sellerId === Number(sellerId))) }
export function getMockSellerSubOrders() { return clone(subOrders) }

export function mockCreateProduct(sellerId, data) {
  const product = { productId: nextProductId++, sellerId: Number(sellerId), categoryId: Number(data.categoryId), title: data.title, description: data.description || '', status: 'INACTIVE', variants: [] }
  products.push(product)
  return { productId: product.productId }
}

export function mockUpdateProduct(productId, data) {
  const product = products.find((item) => item.productId === Number(productId))
  if (!product) throw new Error('Product not found')
  Object.assign(product, data)
  return { updated: true }
}

export function mockAddVariant(productId, data) {
  const product = products.find((item) => item.productId === Number(productId))
  if (!product) throw new Error('Product not found')
  const variant = { variantId: nextVariantId++, sku: data.sku, size: data.size || '', colour: data.colour || '', weightKg: data.weightKg || 0, offers: [] }
  product.variants.push(variant)
  return { variantId: variant.variantId }
}

function findVariant(variantId) {
  for (const product of products) { const variant = product.variants.find((item) => item.variantId === Number(variantId)); if (variant) return variant }
  return null
}

export function mockCreateOffer(variantId, data) {
  const variant = findVariant(variantId)
  if (!variant) throw new Error('Variant not found')
  const offer = { offerId: nextOfferId++, price: Number(data.price), stockQuantity: Number(data.stockQuantity), status: 'ACTIVE', codEligible: data.codEligible !== false }
  variant.offers.push(offer)
  return { offerId: offer.offerId }
}

export function mockUpdateOffer(offerId, data) {
  for (const product of products) for (const variant of product.variants) {
    const offer = variant.offers.find((item) => item.offerId === Number(offerId))
    if (offer) { Object.assign(offer, data); return { updated: true } }
  }
  throw new Error('Offer not found')
}

export function mockUpdateSubOrderStatus(subOrderId, status) {
  const subOrder = subOrders.find((item) => item.subOrderId === Number(subOrderId))
  if (!subOrder) throw new Error('Sub-order not found')
  const next = { PENDING: 'CONFIRMED', CONFIRMED: 'SHIPPED', SHIPPED: 'DELIVERED' }[subOrder.status]
  if (next !== status) throw new Error('Status must move to the next step')
  subOrder.status = status
  if (status === 'SHIPPED') subOrder.trackingNumber = `TRK${Date.now()}`
  return { subOrderId: subOrder.subOrderId, status: subOrder.status, trackingNumber: subOrder.trackingNumber }
}

export function getMockSellerDashboard(sellerId = 2) {
  const ownProducts = products.filter((product) => product.sellerId === Number(sellerId))
  const ownOrders = subOrders.filter((subOrder) => Number(sellerId) === 2)
  const lowStockOffers = ownProducts.flatMap((product) => product.variants.flatMap((variant) => variant.offers)).filter((offer) => offer.stockQuantity < 10).length
  return { products: ownProducts.length, pendingSubOrders: ownOrders.filter((order) => order.status === 'PENDING').length, lowStockOffers }
}
