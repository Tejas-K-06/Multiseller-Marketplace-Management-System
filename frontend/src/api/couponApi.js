import { apiRequest } from './client'
import { isMockMode } from '../mock/mockMode'
import { getMockCoupons, mockCreateCoupon, mockValidateCoupon } from '../mock/coupons'

export function validateCoupon(code) { return isMockMode() ? Promise.resolve(mockValidateCoupon(code)) : apiRequest(`/coupons/validate?code=${encodeURIComponent(code)}`) }
export function getCoupons() { return isMockMode() ? Promise.resolve(getMockCoupons()) : apiRequest('/coupons') }
export function createCoupon(data) { return isMockMode() ? Promise.resolve(mockCreateCoupon(data)) : apiRequest('/coupons', { method: 'POST', body: data }) }
