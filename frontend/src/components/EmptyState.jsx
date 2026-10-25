export default function EmptyState({ message, action }) {
  return <div className="empty"><p>{message}</p>{action || null}</div>
}
