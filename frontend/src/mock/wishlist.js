import { mockProductDetails } from './products'

let wishlists = [{ wishlistId: 1, name: 'Gift ideas', items: [{ variantId: 2, productId: 1, title: 'Nova X Smartphone', size: '256GB', colour: 'Blue', fromPrice: 17999.00, addedAt: '2026-10-20' }] }]

function variantDetails(variantId) {
  for (const product of mockProductDetails) {
    const variant = product.variants.find((item) => item.variantId === Number(variantId))
    if (variant) return { variantId: variant.variantId, productId: product.productId, title: product.title, size: variant.size, colour: variant.colour, fromPrice: Math.min(...variant.offers.map((offer) => offer.price)), addedAt: '2026-10-25' }
  }
  return null
}

export function getMockWishlists() { return wishlists.map((wishlist) => ({ ...wishlist, items: wishlist.items.map((item) => ({ ...item })) })) }

export function mockCreateWishlist({ name }) {
  const wishlist = { wishlistId: wishlists.length + 1, name, items: [] }
  wishlists.push(wishlist)
  return { wishlistId: wishlist.wishlistId }
}

export function mockAddWishlistItem(wishlistId, variantId) {
  const wishlist = wishlists.find((item) => item.wishlistId === Number(wishlistId))
  if (!wishlist) throw new Error('Wishlist not found')
  if (wishlist.items.some((item) => item.variantId === Number(variantId))) throw new Error('This variant is already in the wishlist')
  const item = variantDetails(variantId)
  if (!item) throw new Error('Variant not found')
  wishlist.items.push(item)
  return { added: true }
}

export function mockRemoveWishlistItem(wishlistId, variantId) {
  const wishlist = wishlists.find((item) => item.wishlistId === Number(wishlistId))
  if (!wishlist) throw new Error('Wishlist not found')
  wishlist.items = wishlist.items.filter((item) => item.variantId !== Number(variantId))
  return { removed: true }
}
