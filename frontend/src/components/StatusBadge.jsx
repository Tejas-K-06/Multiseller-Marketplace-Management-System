import { AlertCircle, BadgeCheck, Check, Truck, Undo2, X } from 'lucide-react'

const mappings = {
  PLACED: ['Placed', 'badge-pending'],
  PENDING: ['Pending', 'badge-pending'],
  CONFIRMED: ['Confirmed', 'badge-tint'],
  SHIPPED: ['Shipped', 'badge-tint', Truck],
  DELIVERED: ['Delivered', 'badge-solid', Check],
  CANCELLED: ['Cancelled', 'badge-outline', X],
  SUCCESS: ['Paid', 'badge-solid', Check],
  FAILED: ['Payment failed', 'badge-outline', AlertCircle],
  REFUNDED: ['Refunded', 'badge-tint', Undo2],
  APPROVED: ['Approved', 'badge-solid', Check],
  REJECTED: ['Rejected', 'badge-outline', X],
  INACTIVE: ['Inactive', 'badge-outline']
}

export default function StatusBadge({ status, label }) {
  const [defaultLabel, variant, Icon] = mappings[status] || [status, 'badge-outline']
  return <span className={`badge ${variant}`}>{Icon ? <Icon size={14} aria-hidden="true" /> : null}{label || defaultLabel}</span>
}

export function VerifiedBadge() {
  return <span className="badge badge-tint"><BadgeCheck size={14} aria-hidden="true" />Verified purchase</span>
}

export function StockBadge({ stockQuantity }) {
  if (stockQuantity === 0) return <StatusBadge status="INACTIVE" label="Out of stock" />
  if (stockQuantity < 10) return <span className="badge badge-tint">Low stock: {stockQuantity} left</span>
  return null
}
