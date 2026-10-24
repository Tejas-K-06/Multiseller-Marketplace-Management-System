import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Package } from 'lucide-react'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import StatusBadge, { StockBadge, VerifiedBadge } from '../../components/StatusBadge'
import formatPrice from '../../utils/formatPrice'
import { getProduct, getProductReviews } from '../../api/productApi'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([getProduct(id), getProductReviews(id)])
      .then(([detail, productReviews]) => { setProduct(detail); setReviews(productReviews) })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <main className="page" id="main-content"><Skeleton count={2} /></main>
  if (error || !product) return <main className="page" id="main-content"><Message>{error || 'Product not found.'}</Message></main>

  function placeholderAction(action) {
    setMessage(`${action} will be available in the next step.`)
  }

  return (
    <main className="page" id="main-content">
      {message ? <Message>{message}</Message> : null}
      <div className="detail-layout">
        <section className="detail-section" aria-labelledby="product-title">
          <div className="product-image" aria-hidden="true"><Package size={40} strokeWidth={1.75} /></div>
          <p className="overline">{product.categoryName}</p>
          <h1 className="title-lg" id="product-title">{product.title}</h1>
          <p className="body-lg">{product.description}</p>
          <p className="caption">Sold by {product.storeName}</p>
          <p className="body">{product.avgRating} · {product.reviewCount} reviews</p>
          <section aria-labelledby="variants-title"><h2 className="title-md" id="variants-title">Variants and offers</h2><div className="variant-list">{product.variants.map((variant) => <div className="variant-card" key={variant.variantId}><div className="variant-header"><span className="subheading">{variant.size} · {variant.colour}</span><span className="caption mono">{variant.sku}</span></div><div className="offer-list">{variant.offers.map((offer) => <div className="offer-row" key={offer.offerId}><div><span className="price mono">{formatPrice(offer.price)}</span><p className="caption">{offer.stockQuantity} available</p></div><div className="offer-actions"><StockBadge stockQuantity={offer.stockQuantity} />{offer.codEligible ? <StatusBadge status="CONFIRMED" label="COD available" /> : null}<button className="btn btn-primary" type="button" disabled={offer.stockQuantity === 0} onClick={() => placeholderAction('Add to cart')}>Add to cart</button><button className="btn btn-secondary" type="button" onClick={() => placeholderAction('Add to wishlist')}>Wishlist</button></div></div>)}</div></div>)}</div></section>
        </section>
        <aside className="card detail-section" aria-labelledby="reviews-title"><h2 className="title-md" id="reviews-title">Reviews</h2>{reviews.length ? <div className="review-list">{reviews.map((review) => <article className="review-item" key={review.reviewId}><div className="review-header"><span className="subheading">{review.buyerName}</span>{review.isVerifiedPurchase ? <VerifiedBadge /> : null}</div><p className="small">{review.rating} · {review.comment}</p></article>)}</div> : <p className="body">No reviews yet.</p>}</aside>
      </div>
    </main>
  )
}
