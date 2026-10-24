import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import FormField from '../../components/FormField'
import Message from '../../components/Message'
import { useAuth } from '../../context/AuthContext'

function validate(values) {
  const errors = {}
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (values.password.length < 6) errors.password = 'Password must be at least 6 characters.'
  return errors
}

function homeForRole(role) {
  if (role === 'SELLER') return '/seller'
  if (role === 'ADMIN') return '/admin/sellers'
  return '/'
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
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
    setTouched({ email: true, password: true })
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setMessage('')
    try {
      const user = await login(values)
      navigate(homeForRole(user.role), { replace: true })
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page auth-page" id="main-content">
      <section className="card auth-card" aria-labelledby="login-title">
        <header>
          <p className="overline">Account access</p>
          <h1 className="title-lg" id="login-title">Log in</h1>
          <p className="body">Use your marketplace account to continue.</p>
        </header>
        {location.state?.message ? <Message>{location.state.message}</Message> : null}
        {message ? <Message>{message}</Message> : null}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField label="Email" id="email" error={touched.email ? errors.email : ''}>
            <input className={`input${touched.email && errors.email ? ' input-error' : ''}`} id="email" name="email" type="email" value={values.email} onChange={updateValue} onBlur={() => { setTouched((current) => ({ ...current, email: true })); validateField('email') }} autoComplete="email" required />
          </FormField>
          <FormField label="Password" id="password" error={touched.password ? errors.password : ''}>
            <input className={`input${touched.password && errors.password ? ' input-error' : ''}`} id="password" name="password" type="password" value={values.password} onChange={updateValue} onBlur={() => { setTouched((current) => ({ ...current, password: true })); validateField('password') }} autoComplete="current-password" required />
          </FormField>
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Logging in…' : 'Log in'}</button>
        </form>
      </section>
    </main>
  )
}
