import { apiRequest } from './client'
import { isMockMode } from '../mock/mockMode'
import { getMockCart, mockAddCartItem, mockRemoveCartItem, mockSetCartQuantity } from '../mock/cart'

export function getCart() { return isMockMode() ? Promise.resolve(getMockCart()) : apiRequest('/cart') }
export function addCartItem(data) { return isMockMode() ? Promise.resolve(mockAddCartItem(data)) : apiRequest('/cart/items', { method: 'POST', body: data }) }
export function updateCartItem(lineNo, data) { return isMockMode() ? Promise.resolve(mockSetCartQuantity(lineNo, data.quantity)) : apiRequest(`/cart/items/${lineNo}`, { method: 'PUT', body: data }) }
export function removeCartItem(lineNo) { return isMockMode() ? Promise.resolve(mockRemoveCartItem(lineNo)) : apiRequest(`/cart/items/${lineNo}`, { method: 'DELETE' }) }
