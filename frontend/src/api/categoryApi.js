import { apiRequest } from './client'
import { isMockMode } from '../mock/mockMode'
import { mockCategories } from '../mock/products'

export function getCategories() {
  if (isMockMode()) return Promise.resolve(mockCategories)
  return apiRequest('/categories')
}
