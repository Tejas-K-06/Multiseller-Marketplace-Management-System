export default function Pagination({ page, pageCount, onChange, label = 'Pages' }) {
  if (pageCount <= 1) return null

  return (
    <nav className="pagination" aria-label={label}>
      <button
        className="btn btn-secondary btn-sm"
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span className="small mono" aria-live="polite">
        Page {page} of {pageCount}
      </span>
      <button
        className="btn btn-secondary btn-sm"
        type="button"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  )
}
