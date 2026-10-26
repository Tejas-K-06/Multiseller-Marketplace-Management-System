import { useEffect, useState } from 'react'
import FormField from '../../components/FormField'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import EmptyState from '../../components/EmptyState'
import formatPrice from '../../utils/formatPrice'
import { createAdminCoupon, getAdminCoupons } from '../../api/adminApi'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [values, setValues] = useState({
    code: '',
    discountType: 'PERCENT',
    discountValue: '',
    validUntil: '2027-12-31'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getAdminCoupons()
      .then(setCoupons)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  function update(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (!values.code.trim() || Number(values.discountValue) <= 0 || !values.validUntil) {
      setError('Please provide a coupon code, positive discount value, and validity date.')
      return
    }

    setSubmitting(true)
    try {
      await createAdminCoupon({
        ...values,
        code: values.code.trim().toUpperCase(),
        discountValue: Number(values.discountValue)
      })
      const refreshed = await getAdminCoupons()
      setCoupons(refreshed)
      setValues({
        code: '',
        discountType: 'PERCENT',
        discountValue: '',
        validUntil: '2027-12-31'
      })
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader overline="Admin area" title="Coupons" description="Loading promotional codes…" />
        <Skeleton count={2} />
      </main>
    )
  }

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Admin area"
        title="Coupons"
        description="Create promotional discount codes and monitor active campaigns."
      />

      {error ? <Message>{error}</Message> : null}

      <div className="two-column">
        {/* Left Column: Coupons Table in SectionCard */}
        <SectionCard
          title="Active coupons"
          description={`${coupons.length} ${
            coupons.length === 1 ? 'coupon' : 'coupons'
          } configured`}
        >
          {coupons.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th className="table-number">Discount</th>
                    <th className="table-number">Valid until</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.couponId}>
                      <td data-label="Code" className="mono">
                        <strong>{coupon.code}</strong>
                      </td>
                      <td data-label="Type">
                        <span className="badge badge-outline">
                          {coupon.discountType === 'PERCENT' ? 'Percentage' : 'Flat rate'}
                        </span>
                      </td>
                      <td data-label="Discount" className="table-number mono">
                        {coupon.discountType === 'PERCENT'
                          ? `${coupon.discountValue}%`
                          : formatPrice(coupon.discountValue)}
                      </td>
                      <td data-label="Valid until" className="table-number mono">
                        {coupon.validUntil}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No coupons configured yet." />
          )}
        </SectionCard>

        {/* Right Column: Create Coupon Form in SectionCard */}
        <SectionCard
          title="Create coupon"
          description="Add a new promotional code for buyers."
        >
          <form className="auth-form" onSubmit={submit}>
            <FormField label="Coupon code" id="coupon-code">
              <input
                className="input mono"
                id="coupon-code"
                name="code"
                value={values.code}
                onChange={update}
                placeholder="e.g. SAVE20"
                style={{ textTransform: 'uppercase' }}
                required
              />
            </FormField>

            <FormField label="Discount type" id="discount-type">
              <select
                className="input"
                id="discount-type"
                name="discountType"
                value={values.discountType}
                onChange={update}
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat amount (₹)</option>
              </select>
            </FormField>

            <FormField label="Discount value" id="discount-value">
              <input
                className="input mono"
                id="discount-value"
                name="discountValue"
                type="number"
                min="0.01"
                step="0.01"
                value={values.discountValue}
                onChange={update}
                placeholder={values.discountType === 'PERCENT' ? 'e.g. 15' : 'e.g. 200'}
                required
              />
            </FormField>

            <FormField label="Valid until" id="valid-until">
              <input
                className="input mono"
                id="valid-until"
                name="validUntil"
                type="date"
                value={values.validUntil}
                onChange={update}
                required
              />
            </FormField>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
              style={{ width: '100%' }}
            >
              {submitting ? 'Creating coupon…' : 'Create coupon'}
            </button>
          </form>
        </SectionCard>
      </div>
    </main>
  )
}
