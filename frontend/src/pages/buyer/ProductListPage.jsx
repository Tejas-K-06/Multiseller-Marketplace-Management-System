import { useEffect, useState } from 'react'
import ProductCard from '../../components/ProductCard'
import EmptyState from '../../components/EmptyState'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import { getProducts } from '../../api/productApi'
import { getCategories } from '../../api/categoryApi'

const limit = 12

export default function ProductListPage() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [result, setResult] = useState({ items: [], page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCategories().then(setCategories).catch((requestError) => setError(requestError.message))
  }, [])

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
      <div className="page-header"><div><p className="overline">Catalog</p><h1 className="title-lg">Products</h1><p className="body">Search products and explore categories.</p></div></div>
      {error ? <Message>{error}</Message> : null}
      <form className="filter-bar" onSubmit={submitSearch}>
        <label className="field-label" htmlFor="product-search">Search products</label>
        <div className="inline-actions"><input className="input" id="product-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product or store" /><button className="btn btn-secondary" type="submit">Search</button></div>
        <div className="chip-list" aria-label="Product categories">
          <button className="chip" type="button" aria-pressed={!categoryId} onClick={() => selectCategory('')}>All categories</button>
          {parentCategories.map((category) => <button className="chip" type="button" aria-pressed={String(category.categoryId) === categoryId} key={category.categoryId} onClick={() => selectCategory(String(category.categoryId))}>{category.name}</button>)}
        </div>
      </form>
      {loading ? <Skeleton count={3} /> : result.items.length ? <div className="product-grid">{result.items.map((product) => <ProductCard key={product.productId} product={product} />)}</div> : <EmptyState message="No products match your search." />}
      {result.total > limit ? <nav className="pagination" aria-label="Product pages"><button className="btn btn-secondary" type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span className="small">Page {page} of {pageCount}</span><button className="btn btn-secondary" type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</button></nav> : null}
    </main>
  )
}
