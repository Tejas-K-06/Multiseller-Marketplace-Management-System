import { apiRequest } from './client'
import { isMockMode } from '../mock/mockMode'
import { mockLogin, mockMe, mockRegister } from '../mock/users'

export function register(data) {
  if (isMockMode()) {
    return Promise.resolve(mockRegister(data))
  }

  return apiRequest('/auth/register', { method: 'POST', body: data })
}

export function login(data) {
  if (isMockMode()) {
    return Promise.resolve(mockLogin(data))
  }

  return apiRequest('/auth/login', { method: 'POST', body: data })
}

export function me(token) {
  if (isMockMode()) {
    return Promise.resolve(mockMe(token))
  }

  return apiRequest('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  })
}
