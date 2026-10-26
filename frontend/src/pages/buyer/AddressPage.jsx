import { useEffect, useState } from 'react'
import EmptyState from '../../components/EmptyState'
import FormField from '../../components/FormField'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import { createAddress, deleteAddress, getAddresses } from '../../api/addressApi'

const initialValues = {
  line1: '',
  city: '',
  state: '',
  postalCode: '',
  isDefault: false
}

function validate(values) {
  const errors = {}
  for (const field of ['line1', 'city', 'state']) {
    if (!values[field].trim()) {
      errors[field] = 'This field is required.'
    }
  }
  if (!/^\d{6}$/.test(values.postalCode)) {
    errors.postalCode = 'Postal code must contain exactly 6 digits.'
  }
  return errors
}

export default function AddressPage() {
  const [addresses, setAddresses] = useState([])
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    getAddresses()
      .then(setAddresses)
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false))
  }, [])

  function update(event) {
    const { name, value, type, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function validateField(name) {
    setErrors((current) => ({ ...current, [name]: validate(values)[name] }))
  }

  async function submit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setTouched({ line1: true, city: true, state: true, postalCode: true })
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      await createAddress(values)
      const refreshed = await getAddresses()
      setAddresses(refreshed)
      setValues(initialValues)
      setErrors({})
      setTouched({})
      setMessage('Address added successfully.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(addressId) {
    setDeleting(addressId)
    try {
      await deleteAddress(addressId)
      const refreshed = await getAddresses()
      setAddresses(refreshed)
      setMessage('Address removed.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setDeleting(null)
    }
  }

  function inputProps(name) {
    return {
      onBlur: () => {
        setTouched((current) => ({ ...current, [name]: true }))
        validateField(name)
      },
      className: `input${touched[name] && errors[name] ? ' input-error' : ''}`
    }
  }

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader overline="Buyer area" title="Addresses" description="Loading saved addresses…" />
        <Skeleton count={2} />
      </main>
    )
  }

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Buyer area"
        title="Addresses"
        description="Save delivery details for faster checkout and fulfilment."
      />

      {message ? <Message>{message}</Message> : null}

      <div className="two-column">
        {/* Add Address Form */}
        <section className="card auth-form" aria-labelledby="add-address-heading">
          <h2 className="heading" id="add-address-heading">
            Add a new address
          </h2>
          <form onSubmit={submit} noValidate>
            <div className="form-grid">
              <FormField
                label="Address line"
                id="line1"
                error={touched.line1 ? errors.line1 : ''}
              >
                <input
                  {...inputProps('line1')}
                  id="line1"
                  name="line1"
                  value={values.line1}
                  onChange={update}
                  placeholder="Street name, building"
                  required
                />
              </FormField>

              <FormField label="City" id="city" error={touched.city ? errors.city : ''}>
                <input
                  {...inputProps('city')}
                  id="city"
                  name="city"
                  value={values.city}
                  onChange={update}
                  placeholder="City"
                  required
                />
              </FormField>

              <FormField label="State" id="state" error={touched.state ? errors.state : ''}>
                <input
                  {...inputProps('state')}
                  id="state"
                  name="state"
                  value={values.state}
                  onChange={update}
                  placeholder="State"
                  required
                />
              </FormField>

              <FormField
                label="Postal code"
                id="postalCode"
                error={touched.postalCode ? errors.postalCode : ''}
                helperText="6-digit PIN code"
              >
                <input
                  {...inputProps('postalCode')}
                  id="postalCode"
                  name="postalCode"
                  inputMode="numeric"
                  value={values.postalCode}
                  onChange={update}
                  placeholder="e.g. 411001"
                  required
                />
              </FormField>
            </div>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <input
                type="checkbox"
                name="isDefault"
                checked={values.isDefault}
                onChange={update}
              />
              <span className="small">Set as default delivery address</span>
            </label>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
              style={{ marginTop: 'var(--space-4)', width: '100%' }}
            >
              {submitting ? 'Saving address…' : 'Save address'}
            </button>
          </form>
        </section>

        {/* Saved Addresses Section */}
        <SectionCard
          title="Saved addresses"
          description={`${addresses.length} ${
            addresses.length === 1 ? 'address' : 'addresses'
          } on file`}
        >
          {addresses.length ? (
            <div className="stack-list">
              {addresses.map((address) => (
                <article className="review-item" key={address.addressId}>
                  <div className="inline-actions">
                    <span className="subheading">
                      {address.line1}, {address.city}
                    </span>
                    {address.isDefault ? (
                      <span className="badge badge-solid">Default</span>
                    ) : null}
                  </div>
                  <p className="caption">
                    {address.state} · <span className="mono">{address.postalCode}</span>
                  </p>
                  <div className="inline-actions" style={{ justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      disabled={deleting === address.addressId}
                      onClick={() => remove(address.addressId)}
                    >
                      {deleting === address.addressId ? 'Removing…' : 'Delete'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState message="No addresses saved yet." />
          )}
        </SectionCard>
      </div>
    </main>
  )
}
