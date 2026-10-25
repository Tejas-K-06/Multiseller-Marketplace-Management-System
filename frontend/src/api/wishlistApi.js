import { apiRequest } from './client'
import { isMockMode } from '../mock/mockMode'
import { getMockWishlists, mockAddWishlistItem, mockCreateWishlist, mockRemoveWishlistItem } from '../mock/wishlist'

export function getWishlists() { return isMockMode() ? Promise.resolve(getMockWishlists()) : apiRequest('/wishlists') }
export function createWishlist(data) { return isMockMode() ? Promise.resolve(mockCreateWishlist(data)) : apiRequest('/wishlists', { method: 'POST', body: data }) }
export function addWishlistItem(wishlistId, data) { return isMockMode() ? Promise.resolve(mockAddWishlistItem(wishlistId, data.variantId)) : apiRequest(`/wishlists/${wishlistId}/items`, { method: 'POST', body: data }) }
export function removeWishlistItem(wishlistId, variantId) { return isMockMode() ? Promise.resolve(mockRemoveWishlistItem(wishlistId, variantId)) : apiRequest(`/wishlists/${wishlistId}/items/${variantId}`, { method: 'DELETE' }) }
