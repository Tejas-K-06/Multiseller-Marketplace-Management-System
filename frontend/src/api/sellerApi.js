import { apiRequest } from './client'
import { isMockMode } from '../mock/mockMode'
import { getMockSellerDashboard, getMockSellerProducts, getMockSellerSubOrders, mockAddVariant, mockCreateOffer, mockCreateProduct, mockUpdateOffer, mockUpdateProduct, mockUpdateSubOrderStatus } from '../mock/seller'

export function getSellerDashboard() { return isMockMode() ? Promise.resolve(getMockSellerDashboard()) : Promise.all([getSellerProducts(), getSubOrders()]).then(([products, subOrders]) => ({ products: products.length, pendingSubOrders: subOrders.filter((order) => order.status === 'PENDING').length, lowStockOffers: products.flatMap((product) => product.variants.flatMap((variant) => variant.offers)).filter((offer) => offer.stockQuantity < 10).length })) }
export function getSellerProducts() { return isMockMode() ? Promise.resolve(getMockSellerProducts()) : apiRequest('/seller/products') }
export function createSellerProduct(data) { return isMockMode() ? Promise.resolve(mockCreateProduct(2, data)) : apiRequest('/seller/products', { method: 'POST', body: data }) }
export function updateSellerProduct(productId, data) { return isMockMode() ? Promise.resolve(mockUpdateProduct(productId, data)) : apiRequest(`/seller/products/${productId}`, { method: 'PUT', body: data }) }
export function addVariant(productId, data) { return isMockMode() ? Promise.resolve(mockAddVariant(productId, data)) : apiRequest(`/seller/products/${productId}/variants`, { method: 'POST', body: data }) }
export function createOffer(variantId, data) { return isMockMode() ? Promise.resolve(mockCreateOffer(variantId, data)) : apiRequest(`/seller/variants/${variantId}/offers`, { method: 'POST', body: data }) }
export function updateOffer(offerId, data) { return isMockMode() ? Promise.resolve(mockUpdateOffer(offerId, data)) : apiRequest(`/seller/offers/${offerId}`, { method: 'PUT', body: data }) }
export function getSubOrders() { return isMockMode() ? Promise.resolve(getMockSellerSubOrders()) : apiRequest('/seller/sub-orders') }
export function updateSubOrderStatus(subOrderId, status) { return isMockMode() ? Promise.resolve(mockUpdateSubOrderStatus(subOrderId, status)) : apiRequest(`/seller/sub-orders/${subOrderId}/status`, { method: 'PUT', body: { status } }) }
