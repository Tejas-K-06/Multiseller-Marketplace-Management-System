export default function FormField({ label, id, error, helperText, children }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      {children}
      {error ? <span className="caption field-error" role="alert">{error}</span> : null}
      {!error && helperText ? <span className="caption field-helper">{helperText}</span> : null}
    </div>
  )
}
