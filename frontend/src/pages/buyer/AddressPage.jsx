import { useEffect, useState } from 'react'
import EmptyState from '../../components/EmptyState'
import FormField from '../../components/FormField'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import { createAddress, deleteAddress, getAddresses } from '../../api/addressApi'

const initialValues = { line1: '', city: '', state: '', postalCode: '', isDefault: false }

function validate(values) {
  const errors = {}
  for (const field of ['line1', 'city', 'state']) if (!values[field].trim()) errors[field] = 'This field is required.'
  if (!/^\d{6}$/.test(values.postalCode)) errors.postalCode = 'Postal code must contain 6 digits.'
  return errors
}

export default function AddressPage() {
  const [addresses, setAddresses] = useState([])
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  useEffect(() => { getAddresses().then(setAddresses).catch((error) => setMessage(error.message)).finally(() => setLoading(false)) }, [])
  function update(event) { const { name, value, type, checked } = event.target; setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })) }
  function validateField(name) { setErrors((current) => ({ ...current, [name]: validate(values)[name] })) }
  async function submit(event) { event.preventDefault(); const nextErrors = validate(values); setErrors(nextErrors); setTouched({ line1: true, city: true, state: true, postalCode: true }); if (Object.keys(nextErrors).length) return; try { await createAddress(values); setAddresses(await getAddresses()); setValues(initialValues); setErrors({}); setMessage('Address added.') } catch (error) { setMessage(error.message) } }
  async function remove(addressId) { try { await deleteAddress(addressId); setAddresses(await getAddresses()) } catch (error) { setMessage(error.message) } }
  function inputProps(name) { return { onBlur: () => { setTouched((current) => ({ ...current, [name]: true })); validateField(name) }, className: `input${touched[name] && errors[name] ? ' input-error' : ''}` } }
  if (loading) return <main className="page" id="main-content"><Skeleton count={2} /></main>
  return <main className="page" id="main-content"><div className="page-header"><div><p className="overline">Buyer area</p><h1 className="title-lg">Addresses</h1></div></div>{message ? <Message>{message}</Message> : null}<div className="two-column"><form className="card auth-form" onSubmit={submit} noValidate><h2 className="heading">Add an address</h2><div className="form-grid"><FormField label="Address line" id="line1" error={touched.line1 ? errors.line1 : ''}><input {...inputProps('line1')} id="line1" name="line1" value={values.line1} onChange={update} /></FormField><FormField label="City" id="city" error={touched.city ? errors.city : ''}><input {...inputProps('city')} id="city" name="city" value={values.city} onChange={update} /></FormField><FormField label="State" id="state" error={touched.state ? errors.state : ''}><input {...inputProps('state')} id="state" name="state" value={values.state} onChange={update} /></FormField><FormField label="Postal code" id="postalCode" error={touched.postalCode ? errors.postalCode : ''}><input {...inputProps('postalCode')} id="postalCode" name="postalCode" inputMode="numeric" value={values.postalCode} onChange={update} /></FormField></div><label><input type="checkbox" name="isDefault" checked={values.isDefault} onChange={update} /> Make default address</label><button className="btn btn-primary" type="submit">Add address</button></form><section className="card detail-section" aria-labelledby="saved-addresses"><h2 className="heading" id="saved-addresses">Saved addresses</h2>{addresses.length ? addresses.map((address) => <article className="review-item" key={address.addressId}><div className="inline-actions"><span>{address.line1}, {address.city}</span>{address.isDefault ? <span className="badge badge-solid">Default</span> : null}</div><p className="caption">{address.state} · {address.postalCode}</p><button className="btn btn-secondary" type="button" onClick={() => remove(address.addressId)}>Delete</button></article>) : <EmptyState message="No addresses saved." />}</section></div></main>
}
