import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import EmptyState from '../../components/EmptyState'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import { getProducts } from '../../api/productApi'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProducts({ limit: 3 })
      .then((result) => setProducts(result.items))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="page" id="main-content">
      <section className="hero">
        <div className="hero-copy">
          <p className="overline">A clearer way to shop</p>
          <h1 className="display">Find products from trusted sellers.</h1>
          <p className="body-lg">Browse a focused marketplace with transparent offers, reliable fulfilment and one simple order history.</p>
          <Link className="btn btn-primary" to="/products">Browse products</Link>
        </div>
      </section>
      <section aria-labelledby="featured-products">
        <div className="page-header"><div><p className="overline">Catalog</p><h2 className="title-md" id="featured-products">Featured products</h2></div><Link to="/products">View all products</Link></div>
        {error ? <Message>{error}</Message> : null}
        {loading ? <Skeleton count={3} /> : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.productId} product={product} />)}</div> : <EmptyState message="No products are available right now." />}
      </section>
    </main>
  )
}
