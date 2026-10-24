export default function Skeleton({ count = 3 }) {
  return <div className="skeleton-list" aria-label="Loading" aria-busy="true">{Array.from({ length: count }, (_, index) => <div className="skeleton" key={index} />)}</div>
}
