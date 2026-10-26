export default function Skeleton({ count = 3, className = '' }) {
  return (
    <div
      className={`skeleton-list${className ? ` ${className}` : ''}`}
      aria-label="Loading"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton" key={index} />
      ))}
    </div>
  )
}
