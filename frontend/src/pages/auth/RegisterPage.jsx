import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../../components/FormField'
import Message from '../../components/Message'
import { register } from '../../api/authApi'

const initialValues = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  role: 'BUYER',
  storeName: '',
  taxId: ''
}

function validate(values) {
  const errors = {}
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (values.password.length < 6) errors.password = 'Password must be at least 6 characters.'
  if (!values.fullName.trim()) errors.fullName = 'Full name is required.'
  if (values.phone && !/^\d{10}$/.test(values.phone)) errors.phone = 'Phone must contain exactly 10 digits.'
  if (values.role === 'SELLER' && !values.storeName.trim()) errors.storeName = 'Store name is required for sellers.'
  return errors
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateValue(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function validateField(name) {
    const nextErrors = validate(values)
    setErrors((current) => ({ ...current, [name]: nextErrors[name] }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setTouched(Object.keys(values).reduce((result, key) => ({ ...result, [key]: true }), {}))
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setMessage('')
    try {
      await register({ ...values, storeName: values.role === 'SELLER' ? values.storeName : undefined, taxId: values.role === 'SELLER' ? values.taxId : undefined })
      navigate('/login', { replace: true, state: { message: 'Registration complete. Log in to continue.' } })
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  function fieldProps(name) {
    return {
      onBlur: () => { setTouched((current) => ({ ...current, [name]: true })); validateField(name) },
      className: `input${touched[name] && errors[name] ? ' input-error' : ''}`
    }
  }

  return (
    <main className="page auth-page" id="main-content">
      <section className="card auth-card" aria-labelledby="register-title">
        <header>
          <p className="overline">New account</p>
          <h1 className="title-lg" id="register-title">Register</h1>
          <p className="body">Create a buyer account or register your store.</p>
        </header>
        {message ? <Message>{message}</Message> : null}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField label="Full name" id="fullName" error={touched.fullName ? errors.fullName : ''}>
            <input {...fieldProps('fullName')} id="fullName" name="fullName" value={values.fullName} onChange={updateValue} autoComplete="name" required />
          </FormField>
          <FormField label="Email" id="email" error={touched.email ? errors.email : ''}>
            <input {...fieldProps('email')} id="email" name="email" type="email" value={values.email} onChange={updateValue} autoComplete="email" required />
          </FormField>
          <FormField label="Password" id="password" error={touched.password ? errors.password : ''} helperText="At least 6 characters.">
            <input {...fieldProps('password')} id="password" name="password" type="password" value={values.password} onChange={updateValue} autoComplete="new-password" required />
          </FormField>
          <FormField label="Phone (optional)" id="phone" error={touched.phone ? errors.phone : ''}>
            <input {...fieldProps('phone')} id="phone" name="phone" inputMode="numeric" value={values.phone} onChange={updateValue} autoComplete="tel" />
          </FormField>
          <fieldset className="role-options">
            <legend className="field-label">Account type</legend>
            <label><input type="radio" name="role" value="BUYER" checked={values.role === 'BUYER'} onChange={updateValue} /> Buyer</label>
            <label><input type="radio" name="role" value="SELLER" checked={values.role === 'SELLER'} onChange={updateValue} /> Seller</label>
          </fieldset>
          {values.role === 'SELLER' ? (
            <>
              <FormField label="Store name" id="storeName" error={touched.storeName ? errors.storeName : ''}>
                <input {...fieldProps('storeName')} id="storeName" name="storeName" value={values.storeName} onChange={updateValue} required />
              </FormField>
              <FormField label="Tax ID (optional)" id="taxId" error={touched.taxId ? errors.taxId : ''}>
                <input {...fieldProps('taxId')} id="taxId" name="taxId" value={values.taxId} onChange={updateValue} />
              </FormField>
            </>
          ) : null}
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Registering…' : 'Register'}</button>
          <p className="small">Already have an account? <Link to="/login">Log in</Link>.</p>
        </form>
      </section>
    </main>
  )
}
