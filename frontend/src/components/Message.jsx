import { Info } from 'lucide-react'

export default function Message({ children }) {
  return (
    <div className="alert" role="status">
      <Info size={16} aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}
