import { apiRequest } from './client'
import { isMockMode } from '../mock/mockMode'
import { mockGetProduct, mockListProducts, mockProductReviews } from '../mock/products'

export function getProducts(params = {}) {
  if (isMockMode()) return Promise.resolve(mockListProducts(params))
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''))
  return apiRequest(`/products?${query.toString()}`)
}

export function getProduct(productId) {
  if (isMockMode()) return Promise.resolve(mockGetProduct(productId))
  return apiRequest(`/products/${productId}`)
}

export function getProductReviews(productId) {
  if (isMockMode()) return Promise.resolve(mockProductReviews[productId] || [])
  return apiRequest(`/products/${productId}/reviews`)
}
