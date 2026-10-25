import { mockProductDetails } from './products'

let cart = { cartId: 1, items: [], estimatedTotal: 0 }

function findOffer(offerId) {
  for (const product of mockProductDetails) {
    for (const variant of product.variants) {
      const offer = variant.offers.find((item) => item.offerId === Number(offerId))
      if (offer) return { product, variant, offer }
    }
  }
  return null
}

function refreshTotal() {
  cart.estimatedTotal = cart.items.reduce((total, item) => total + item.lineTotal, 0)
  return { cartId: cart.cartId, items: cart.items.map((item) => ({ ...item })), estimatedTotal: cart.estimatedTotal }
}

function addItemFromOffer(offerId, quantity) {
  const found = findOffer(offerId)
  if (!found) throw new Error('Offer not found')
  const existing = cart.items.find((item) => item.offerId === Number(offerId))
  const nextQuantity = (existing?.quantity || 0) + quantity
  if (nextQuantity > found.offer.stockQuantity) throw new Error('Quantity exceeds available stock')
  if (existing) {
    existing.quantity = nextQuantity
    existing.lineTotal = existing.price * nextQuantity
  } else {
    cart.items.push({ lineNo: cart.items.length + 1, offerId: found.offer.offerId, title: found.product.title, size: found.variant.size, colour: found.variant.colour, storeName: found.product.storeName, price: found.offer.price, quantity, stockQuantity: found.offer.stockQuantity, lineTotal: found.offer.price * quantity })
  }
  return refreshTotal()
}

export function getMockCart() {
  if (!cart.items.length) addItemFromOffer(3, 2)
  return refreshTotal()
}

export function mockAddCartItem({ offerId, quantity }) { return addItemFromOffer(offerId, Number(quantity)) }

export function mockSetCartQuantity(lineNo, quantity) {
  const item = cart.items.find((entry) => entry.lineNo === Number(lineNo))
  if (!item) throw new Error('Cart item not found')
  if (quantity < 1 || quantity > item.stockQuantity) throw new Error('Quantity exceeds available stock')
  item.quantity = Number(quantity)
  item.lineTotal = item.price * item.quantity
  return refreshTotal()
}

export function mockRemoveCartItem(lineNo) {
  cart.items = cart.items.filter((item) => item.lineNo !== Number(lineNo)).map((item, index) => ({ ...item, lineNo: index + 1 }))
  return refreshTotal()
}

export function mockClearCart() { cart.items = []; return refreshTotal() }
export function mockCartItems() { return cart.items.map((item) => ({ ...item })) }
