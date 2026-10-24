import { apiRequest } from './client'
import { isMockMode } from '../mock/mockMode'
import { getMockOrder, getMockOrders, mockCancelOrder, mockCheckout, mockPayOrder } from '../mock/orders'

export function checkout(data) { return isMockMode() ? Promise.resolve(mockCheckout(data)) : apiRequest('/orders/checkout', { method: 'POST', body: data }) }
export function getOrders() { return isMockMode() ? Promise.resolve(getMockOrders()) : apiRequest('/orders') }
export function getOrder(orderId) { return isMockMode() ? Promise.resolve(getMockOrder(orderId)) : apiRequest(`/orders/${orderId}`) }
export function cancelOrder(orderId) { return isMockMode() ? Promise.resolve(mockCancelOrder(orderId)) : apiRequest(`/orders/${orderId}/cancel`, { method: 'PUT' }) }
export function payOrder(orderId, outcome) { return isMockMode() ? Promise.resolve(mockPayOrder(orderId, outcome)) : apiRequest(`/orders/${orderId}/pay`, { method: 'POST', body: { outcome } }) }
