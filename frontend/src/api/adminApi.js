import { apiRequest } from './client'
import { isMockMode } from '../mock/mockMode'
import { getMockAdminCategories, getMockAdminOrders, getMockAdminStats, getMockCoupons, getMockSellers, mockCreateCategory, mockCreateCoupon, mockSetSellerApproval } from '../mock/admin'

export function getSellers(status) { return isMockMode() ? Promise.resolve(getMockSellers(status)) : apiRequest(`/admin/sellers${status ? `?status=${status}` : ''}`) }
export function setSellerApproval(sellerId, status) { return isMockMode() ? Promise.resolve(mockSetSellerApproval(sellerId, status)) : apiRequest(`/admin/sellers/${sellerId}/approval`, { method: 'PUT', body: { status } }) }
export function getAdminCategories() { return isMockMode() ? Promise.resolve(getMockAdminCategories()) : apiRequest('/categories') }
export function createAdminCategory(data) { return isMockMode() ? Promise.resolve(mockCreateCategory(data)) : apiRequest('/categories', { method: 'POST', body: data }) }
export function getAdminCoupons() { return isMockMode() ? Promise.resolve(getMockCoupons()) : apiRequest('/coupons') }
export function createAdminCoupon(data) { return isMockMode() ? Promise.resolve(mockCreateCoupon(data)) : apiRequest('/coupons', { method: 'POST', body: data }) }
export function getAdminOrders() { return isMockMode() ? Promise.resolve(getMockAdminOrders()) : apiRequest('/admin/orders') }
export function getAdminStats() { return isMockMode() ? Promise.resolve(getMockAdminStats()) : apiRequest('/admin/stats') }
