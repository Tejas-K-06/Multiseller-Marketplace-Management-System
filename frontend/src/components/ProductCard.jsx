import { Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StockBadge } from './StatusBadge'
import formatPrice from '../utils/formatPrice'

export default function ProductCard({ product }) {
  return (
    <Link
      className="card product-card"
      to={`/products/${product.productId}`}
      aria-label={`${product.title} from ${product.storeName}`}
    >
      <div className="product-image" aria-hidden="true">
        <Package size={28} strokeWidth={1.75} />
      </div>
      <div className="product-card-content">
        <h2 className="subheading">{product.title}</h2>
        <p className="caption">Sold by {product.storeName}</p>
        <p className="price mono">From {formatPrice(product.fromPrice)}</p>
        <p className="caption">
          {product.avgRating ? `${product.avgRating} · ` : ''}
          {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
        </p>
        {product.stockQuantity !== undefined ? (
          <div className="product-card-badges">
            <StockBadge stockQuantity={product.stockQuantity} />
          </div>
        ) : null}
      </div>
    </Link>
  )
}
