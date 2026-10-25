import { apiRequest } from './client'
import { isMockMode } from '../mock/mockMode'
import { getMockAddresses, mockCreateAddress, mockDeleteAddress } from '../mock/addresses'

export function getAddresses() { return isMockMode() ? Promise.resolve(getMockAddresses()) : apiRequest('/addresses') }
export function createAddress(data) { return isMockMode() ? Promise.resolve(mockCreateAddress(data)) : apiRequest('/addresses', { method: 'POST', body: data }) }
export function deleteAddress(addressId) { return isMockMode() ? Promise.resolve(mockDeleteAddress(addressId)) : apiRequest(`/addresses/${addressId}`, { method: 'DELETE' }) }
