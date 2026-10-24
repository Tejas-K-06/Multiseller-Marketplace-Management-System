import { Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import formatPrice from '../utils/formatPrice'

export default function ProductCard({ product }) {
  return (
    <article className="card product-card">
      <div className="product-image" aria-hidden="true"><Package size={28} strokeWidth={1.75} /></div>
      <div className="product-card-content">
        <h2 className="subheading"><Link to={`/products/${product.productId}`}>{product.title}</Link></h2>
        <p className="caption">{product.storeName}</p>
        <p className="price mono">From {formatPrice(product.fromPrice)}</p>
        <p className="caption">{product.avgRating} · {product.reviewCount} reviews</p>
      </div>
    </article>
  )
}
