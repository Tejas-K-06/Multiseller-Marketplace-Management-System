let addresses = [{ addressId: 1, line1: '12 MG Road', city: 'Pune', state: 'Maharashtra', postalCode: '411001', isDefault: true }]

export function getMockAddresses() { return addresses.map((address) => ({ ...address })) }

export function mockCreateAddress(data) {
  if (data.isDefault) addresses = addresses.map((address) => ({ ...address, isDefault: false }))
  const address = { addressId: addresses.length + 1, line1: data.line1, city: data.city, state: data.state, postalCode: data.postalCode, isDefault: Boolean(data.isDefault) }
  if (!addresses.length) address.isDefault = true
  addresses.push(address)
  return { addressId: address.addressId }
}

export function mockDeleteAddress(addressId) {
  addresses = addresses.filter((address) => address.addressId !== Number(addressId))
  return { deleted: true }
}
