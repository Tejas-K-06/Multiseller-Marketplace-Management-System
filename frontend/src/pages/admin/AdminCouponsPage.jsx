import { useEffect, useState } from 'react'
import FormField from '../../components/FormField'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import { createAdminCoupon, getAdminCoupons } from '../../api/adminApi'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [values, setValues] = useState({ code: '', discountType: 'PERCENT', discountValue: '', validUntil: '2027-12-31' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { getAdminCoupons().then(setCoupons).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)) }, [])
  function update(event) { const { name, value } = event.target; setValues((current) => ({ ...current, [name]: value })) }
  async function submit(event) { event.preventDefault(); if (!values.code.trim() || Number(values.discountValue) <= 0 || !values.validUntil) { setError('Enter a code, positive discount and validity date.'); return } try { await createAdminCoupon({ ...values, discountValue: Number(values.discountValue) }); setCoupons(await getAdminCoupons()); setValues({ code: '', discountType: 'PERCENT', discountValue: '', validUntil: '2027-12-31' }); setError('') } catch (requestError) { setError(requestError.message) } }
  if (loading) return <main className="page" id="main-content"><Skeleton count={2} /></main>
  return <main className="page" id="main-content"><div className="page-header"><div><p className="overline">Admin area</p><h1 className="title-lg">Coupons</h1></div></div>{error ? <Message>{error}</Message> : null}<div className="two-column"><div className="table-wrap"><table><thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Valid until</th></tr></thead><tbody>{coupons.map((coupon) => <tr key={coupon.couponId}><td data-label="Code" className="mono">{coupon.code}</td><td data-label="Type">{coupon.discountType}</td><td data-label="Value" className="mono">{coupon.discountValue}</td><td data-label="Valid until" className="mono">{coupon.validUntil}</td></tr>)}</tbody></table></div><form className="card auth-form" onSubmit={submit}><h2 className="heading">Create coupon</h2><FormField label="Code" id="coupon-code"><input className="input mono" id="coupon-code" name="code" value={values.code} onChange={update} /></FormField><FormField label="Discount type" id="discount-type"><select className="input" id="discount-type" name="discountType" value={values.discountType} onChange={update}><option value="PERCENT">Percent</option><option value="FLAT">Flat</option></select></FormField><FormField label="Discount value" id="discount-value"><input className="input mono" id="discount-value" name="discountValue" type="number" min="0.01" value={values.discountValue} onChange={update} /></FormField><FormField label="Valid until" id="valid-until"><input className="input mono" id="valid-until" name="validUntil" type="date" value={values.validUntil} onChange={update} /></FormField><button className="btn btn-primary" type="submit">Create coupon</button></form></div></main>
}
