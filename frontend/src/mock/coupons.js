let coupons = [
  { couponId: 1, code: 'WELCOME10', discountType: 'PERCENT', discountValue: 10, validUntil: '2027-12-31' },
  { couponId: 2, code: 'FLAT100', discountType: 'FLAT', discountValue: 100, validUntil: '2027-12-31' }
]

export function getMockCoupons() { return coupons.map((coupon) => ({ ...coupon })) }

export function mockValidateCoupon(code) {
  const coupon = coupons.find((item) => item.code === code.trim().toUpperCase())
  if (!coupon) throw new Error('Coupon not found')
  if (coupon.validUntil < '2026-10-25') throw new Error('Coupon has expired')
  return { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, validUntil: coupon.validUntil }
}

export function mockCreateCoupon(data) {
  if (coupons.some((coupon) => coupon.code === data.code.toUpperCase())) throw new Error('Coupon code already exists')
  const coupon = { couponId: coupons.length + 1, code: data.code.toUpperCase(), discountType: data.discountType, discountValue: Number(data.discountValue), validUntil: data.validUntil }
  coupons.push(coupon)
  return { couponId: coupon.couponId }
}
