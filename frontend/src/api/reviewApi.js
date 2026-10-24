import { apiRequest } from './client'
import { isMockMode } from '../mock/mockMode'
import { mockCreateReview } from '../mock/orders'

export function createReview(data) { return isMockMode() ? Promise.resolve(mockCreateReview(data)) : apiRequest('/reviews', { method: 'POST', body: data }) }
