export default function StatCard({ label, value, detail, className = '' }) {
  return (
    <article className={`card stat-card${className ? ` ${className}` : ''}`}>
      <p className="overline">{label}</p>
      <p className="stat-value mono">{value}</p>
      {detail ? <p className="caption">{detail}</p> : null}
    </article>
  )
}
