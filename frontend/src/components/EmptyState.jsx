export default function EmptyState({ message, action, className = '' }) {
  return (
    <div className={`empty${className ? ` ${className}` : ''}`} role="status">
      <p className="body">{message}</p>
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  )
}
