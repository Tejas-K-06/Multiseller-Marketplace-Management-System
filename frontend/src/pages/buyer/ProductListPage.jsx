import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import EmptyState from '../../components/EmptyState'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import Pagination from '../../components/Pagination'
import { getProducts } from '../../api/productApi'
import { getCategories } from '../../api/categoryApi'

const limit = 12

export default function ProductListPage() {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [search, setSearch] = useState(initialQuery)
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [result, setResult] = useState({ items: [], page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((requestError) => setError(requestError.message))
  }, [])

  useEffect(() => {
    setQuery(initialQuery)
    setSearch(initialQuery)
    setPage(1)
  }, [initialQuery])

  useEffect(() => {
    setLoading(true)
    getProducts({ q: search, categoryId: categoryId || undefined, page, limit })
      .then(setResult)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [search, categoryId, page])

  function submitSearch(event) {
    event.preventDefault()
    setPage(1)
    setSearch(query)
  }

  function selectCategory(value) {
    setCategoryId(value)
    setPage(1)
  }

  const parentCategories = categories.filter((category) => category.parentId === null)
  const pageCount = Math.max(1, Math.ceil(result.total / limit))

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Catalog"
        title="Products"
        description="Search products, compare seller offers, and filter by category."
      />

      {error ? <Message>{error}</Message> : null}

      <form className="filter-bar" onSubmit={submitSearch} role="search">
        <label className="field-label" htmlFor="product-search">
          Search products
        </label>
        <div className="inline-actions">
          <input
            className="input"
            id="product-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by product title or store name…"
          />
          <button className="btn btn-secondary" type="submit">
            Search
          </button>
        </div>

        <div className="chip-list" aria-label="Product categories">
          <button
            className="chip"
            type="button"
            aria-pressed={!categoryId}
            onClick={() => selectCategory('')}
          >
            All categories
          </button>
          {parentCategories.map((category) => (
            <button
              className="chip"
              type="button"
              aria-pressed={String(category.categoryId) === categoryId}
              key={category.categoryId}
              onClick={() => selectCategory(String(category.categoryId))}
            >
              {category.name}
            </button>
          ))}
        </div>
      </form>

      {!loading ? (
        <p className="caption" aria-live="polite">
          Showing {result.total} {result.total === 1 ? 'product' : 'products'}
        </p>
      ) : null}

      {loading ? (
        <Skeleton count={6} className="skeleton-grid" />
      ) : result.items.length ? (
        <div className="product-grid">
          {result.items.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          message="No products match your search or filter criteria."
          action={
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={() => {
                setQuery('')
                setSearch('')
                setCategoryId('')
                setPage(1)
              }}
            >
              Clear filters
            </button>
          }
        />
      )}

      <Pagination
        page={page}
        pageCount={pageCount}
        onChange={setPage}
        label="Product catalog pages"
      />
    </main>
  )
}
