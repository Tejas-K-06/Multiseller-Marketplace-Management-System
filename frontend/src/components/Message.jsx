import { Info } from 'lucide-react'

export default function Message({ children, role = 'status' }) {
  return (
    <div className="alert" role={role} aria-live={role === 'alert' ? 'assertive' : 'polite'}>
      <Info size={16} aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}
