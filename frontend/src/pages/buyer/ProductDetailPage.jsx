import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Package } from 'lucide-react'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import StatusBadge, { StockBadge, VerifiedBadge } from '../../components/StatusBadge'
import formatPrice from '../../utils/formatPrice'
import { getProduct, getProductReviews } from '../../api/productApi'
import { addCartItem } from '../../api/cartApi'
import { addWishlistItem, createWishlist, getWishlists } from '../../api/wishlistApi'
import { useAuth } from '../../context/AuthContext'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [wishlists, setWishlists] = useState([])
  const [wishlistOffer, setWishlistOffer] = useState(null)
  const [selectedWishlist, setSelectedWishlist] = useState('')
  const [newWishlistName, setNewWishlistName] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([getProduct(id), getProductReviews(id)])
      .then(([detail, productReviews]) => { setProduct(detail); setReviews(productReviews) })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <main className="page" id="main-content"><Skeleton count={2} /></main>
  if (error || !product) return <main className="page" id="main-content"><Message>{error || 'Product not found.'}</Message></main>

  function ensureBuyer() {
    if (!user) { navigate('/login'); return false }
    if (user.role !== 'BUYER') { setMessage('A buyer account is required for cart and wishlist actions.'); return false }
    return true
  }

  async function handleAddToCart(offer) {
    if (!ensureBuyer()) return
    try { await addCartItem({ offerId: offer.offerId, quantity: 1 }); setMessage('Added to cart.') } catch (requestError) { setMessage(requestError.message) }
  }

  async function openWishlistPicker(variant) {
    if (!ensureBuyer()) return
    try {
      const lists = await getWishlists()
      setWishlists(lists)
      setSelectedWishlist(String(lists[0]?.wishlistId || ''))
      setWishlistOffer(variant)
    } catch (requestError) { setMessage(requestError.message) }
  }

  async function saveToWishlist() {
    if (!selectedWishlist) { setMessage('Choose a wishlist or create one first.'); return }
    try { await addWishlistItem(selectedWishlist, { variantId: wishlistOffer.variantId }); setMessage('Added to wishlist.'); setWishlistOffer(null) } catch (requestError) { setMessage(requestError.message) }
  }

  async function createAndSaveWishlist() {
    if (!newWishlistName.trim()) { setMessage('Enter a name for the new wishlist.'); return }
    try {
      const created = await createWishlist({ name: newWishlistName.trim() })
      await addWishlistItem(created.wishlistId, { variantId: wishlistOffer.variantId })
      setMessage('Wishlist created and variant added.')
      setNewWishlistName('')
      setWishlistOffer(null)
    } catch (requestError) { setMessage(requestError.message) }
  }

  return (
    <main className="page" id="main-content">
      {message ? <Message>{message}</Message> : null}
      {wishlistOffer ? <div className="picker-panel"><strong className="heading">Save to wishlist</strong><label className="field"><span className="field-label">Existing wishlist</span><select className="input" value={selectedWishlist} onChange={(event) => setSelectedWishlist(event.target.value)}><option value="">Choose a wishlist</option>{wishlists.map((wishlist) => <option value={wishlist.wishlistId} key={wishlist.wishlistId}>{wishlist.name}</option>)}</select></label><div className="inline-actions"><button className="btn btn-primary" type="button" onClick={saveToWishlist}>Save variant</button><button className="btn btn-ghost" type="button" onClick={() => setWishlistOffer(null)}>Close</button></div><label className="field"><span className="field-label">Or create a new wishlist</span><input className="input" value={newWishlistName} onChange={(event) => setNewWishlistName(event.target.value)} placeholder="Wishlist name" /></label><button className="btn btn-secondary" type="button" onClick={createAndSaveWishlist}>Create and save</button></div> : null}
      <div className="detail-layout">
        <section className="detail-section" aria-labelledby="product-title">
          <div className="product-image" aria-hidden="true"><Package size={40} strokeWidth={1.75} /></div>
          <p className="overline">{product.categoryName}</p>
          <h1 className="title-lg" id="product-title">{product.title}</h1>
          <p className="body-lg">{product.description}</p>
          <p className="caption">Sold by {product.storeName}</p>
          <p className="body">{product.avgRating} · {product.reviewCount} reviews</p>
          <section aria-labelledby="variants-title"><h2 className="title-md" id="variants-title">Variants and offers</h2><div className="variant-list">{product.variants.map((variant) => <div className="variant-card" key={variant.variantId}><div className="variant-header"><span className="subheading">{variant.size} · {variant.colour}</span><span className="caption mono">{variant.sku}</span></div><div className="offer-list">{variant.offers.map((offer) => <div className="offer-row" key={offer.offerId}><div><span className="price mono">{formatPrice(offer.price)}</span><p className="caption">{offer.stockQuantity} available</p></div><div className="offer-actions"><StockBadge stockQuantity={offer.stockQuantity} />{offer.codEligible ? <StatusBadge status="CONFIRMED" label="COD available" /> : null}<button className="btn btn-primary" type="button" disabled={offer.stockQuantity === 0} onClick={() => handleAddToCart(offer)}>Add to cart</button><button className="btn btn-secondary" type="button" onClick={() => openWishlistPicker(variant)}>Wishlist</button></div></div>)}</div></div>)}</div></section>
        </section>
        <aside className="card detail-section" aria-labelledby="reviews-title"><h2 className="title-md" id="reviews-title">Reviews</h2>{reviews.length ? <div className="review-list">{reviews.map((review) => <article className="review-item" key={review.reviewId}><div className="review-header"><span className="subheading">{review.buyerName}</span>{review.isVerifiedPurchase ? <VerifiedBadge /> : null}</div><p className="small">{review.rating} · {review.comment}</p></article>)}</div> : <p className="body">No reviews yet.</p>}</aside>
      </div>
    </main>
  )
}
