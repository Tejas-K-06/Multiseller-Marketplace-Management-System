import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import EmptyState from '../../components/EmptyState'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import { getProducts } from '../../api/productApi'

export default function HomePage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  function submitSearch(event) {
    event.preventDefault()
    navigate(`/products${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
  }

  useEffect(() => {
    getProducts({ limit: 4 })
      .then((result) => setProducts(result.items))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="page" id="main-content">
      <section className="hero" aria-labelledby="home-title">
        <PageHeader
          overline="Multi-Seller Marketplace"
          title="Find products from trusted sellers."
          titleClassName="display"
          titleId="home-title"
          description="Browse a focused catalog with transparent offers, reliable fulfilment, and simple order history."
          action={
            <Link className="btn btn-primary" to="/products">
              Browse all products
            </Link>
          }
        >
          <div className="home-tools">
            <form className="inline-actions" onSubmit={submitSearch} role="search">
              <label className="sr-only" htmlFor="home-search">
                Search products
              </label>
              <input
                className="input"
                id="home-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products or stores…"
              />
              <button className="btn btn-secondary" type="submit">
                Search
              </button>
            </form>
            <div className="chip-list" aria-label="Suggested categories">
              <Link className="chip" to="/products?q=electronics">
                Electronics
              </Link>
              <Link className="chip" to="/products?q=mobiles">
                Mobiles
              </Link>
              <Link className="chip" to="/products?q=t-shirt">
                Fashion
              </Link>
            </div>
          </div>
        </PageHeader>
      </section>

      <div className="notice-band" role="note">
        <span className="overline">Marketplace notice</span>
        <span>Compare variant pricing and offers across sellers before completing checkout.</span>
      </div>

      <section aria-labelledby="featured-products">
        <div className="page-header">
          <div>
            <p className="overline">Catalog</p>
            <h2 className="title-md" id="featured-products">
              Featured products
            </h2>
          </div>
          <Link className="small" to="/products">
            View all products →
          </Link>
        </div>

        {error ? <Message>{error}</Message> : null}

        {loading ? (
          <Skeleton count={4} className="skeleton-grid" />
        ) : products.length ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            message="No products are available right now."
            action={
              <Link className="btn btn-secondary btn-sm" to="/products">
                Refresh catalog
              </Link>
            }
          />
        )}
      </section>
    </main>
  )
}
