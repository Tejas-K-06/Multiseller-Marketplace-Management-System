import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Package } from 'lucide-react'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import Breadcrumb from '../../components/Breadcrumb'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
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
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [selectedOfferId, setSelectedOfferId] = useState(null)
  const [wishlists, setWishlists] = useState([])
  const [wishlistPickerOpen, setWishlistPickerOpen] = useState(false)
  const [selectedWishlist, setSelectedWishlist] = useState('')
  const [newWishlistName, setNewWishlistName] = useState('')
  const [busyOffer, setBusyOffer] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([getProduct(id), getProductReviews(id)])
      .then(([detail, productReviews]) => {
        setProduct(detail)
        setReviews(productReviews)
        if (detail?.variants?.length > 0) {
          setSelectedVariantIndex(0)
          setSelectedOfferId(detail.variants[0]?.offers?.[0]?.offerId || null)
        }
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader overline="Product details" title="Loading product…" />
        <Skeleton count={2} />
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="page" id="main-content">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Products', to: '/products' }]} />
        <PageHeader overline="Product details" title="Product not found" />
        <Message>{error || 'The requested product could not be found.'}</Message>
      </main>
    )
  }

  const selectedVariant = product.variants?.[selectedVariantIndex] || product.variants?.[0]
  const availableOffers = selectedVariant?.offers || []
  const activeOffer = availableOffers.find((o) => o.offerId === selectedOfferId) || availableOffers[0]

  function ensureBuyer() {
    if (!user) {
      navigate('/login')
      return false
    }
    if (user.role !== 'BUYER') {
      setMessage('A buyer account is required for cart and wishlist actions.')
      return false
    }
    return true
  }

  async function handleAddToCart(offer) {
    if (!ensureBuyer()) return
    const targetOffer = offer || activeOffer
    if (!targetOffer) return

    setBusyOffer(targetOffer.offerId)
    try {
      await addCartItem({ offerId: targetOffer.offerId, quantity: 1 })
      setMessage('Added to cart successfully.')
    } catch (requestError) {
      setMessage(requestError.message)
    } finally {
      setBusyOffer(null)
    }
  }

  async function openWishlistPicker() {
    if (!ensureBuyer()) return
    try {
      const lists = await getWishlists()
      setWishlists(lists)
      setSelectedWishlist(String(lists[0]?.wishlistId || ''))
      setWishlistPickerOpen(true)
    } catch (requestError) {
      setMessage(requestError.message)
    }
  }

  async function saveToWishlist() {
    if (!selectedWishlist) {
      setMessage('Choose a wishlist or create one first.')
      return
    }
    try {
      await addWishlistItem(selectedWishlist, { variantId: selectedVariant.variantId })
      setMessage('Variant saved to wishlist.')
      setWishlistPickerOpen(false)
    } catch (requestError) {
      setMessage(requestError.message)
    }
  }

  async function createAndSaveWishlist() {
    if (!newWishlistName.trim()) {
      setMessage('Enter a name for the new wishlist.')
      return
    }
    try {
      const created = await createWishlist({ name: newWishlistName.trim() })
      await addWishlistItem(created.wishlistId, { variantId: selectedVariant.variantId })
      setMessage('Wishlist created and variant saved.')
      setNewWishlistName('')
      setWishlistPickerOpen(false)
    } catch (requestError) {
      setMessage(requestError.message)
    }
  }

  return (
    <main className="page" id="main-content">
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Products', to: '/products' },
          { label: product.title }
        ]}
      />

      {message ? <Message>{message}</Message> : null}

      <div className="two-column">
        {/* Left Column: Product Info, Variants as Chips, Offers, Reviews */}
        <div className="content-stack">
          <section className="card detail-section" aria-labelledby="product-title">
            <div className="product-image" aria-hidden="true">
              <Package size={48} strokeWidth={1.75} />
            </div>

            <PageHeader
              overline={product.categoryName}
              title={product.title}
              titleId="product-title"
              description={product.description}
            />

            <p className="caption">Sold by {product.storeName}</p>

            <div className="rating-summary">
              <strong>{product.avgRating}</strong>
              <span aria-label={`${product.avgRating} out of 5 stars`}>★★★★★</span>
              <span className="caption">
                {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            {/* Variants as Chips */}
            {product.variants?.length > 0 ? (
              <div className="field">
                <span className="field-label">Available variants</span>
                <div className="chip-list" role="radiogroup" aria-label="Product variants">
                  {product.variants.map((variant, index) => {
                    const isSelected = index === selectedVariantIndex
                    return (
                      <button
                        key={variant.variantId}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-pressed={isSelected}
                        className="chip"
                        onClick={() => {
                          setSelectedVariantIndex(index)
                          setSelectedOfferId(variant.offers?.[0]?.offerId || null)
                        }}
                      >
                        {variant.size} · {variant.colour}
                      </button>
                    )
                  })}
                </div>
                {selectedVariant?.sku ? (
                  <p className="caption mono">SKU: {selectedVariant.sku}</p>
                ) : null}
              </div>
            ) : null}

            {/* Offers as Selectable Rows */}
            {availableOffers.length > 0 ? (
              <div className="field">
                <span className="field-label">Seller offers for this variant</span>
                <div className="variant-list" role="radiogroup" aria-label="Seller offers">
                  {availableOffers.map((offer) => {
                    const isSelected = offer.offerId === activeOffer?.offerId
                    return (
                      <div
                        key={offer.offerId}
                        className={`select-row${isSelected ? ' selected' : ''}`}
                        onClick={() => setSelectedOfferId(offer.offerId)}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault()
                            setSelectedOfferId(offer.offerId)
                          }
                        }}
                      >
                        <input
                          type="radio"
                          name="sellerOffer"
                          checked={isSelected}
                          onChange={() => setSelectedOfferId(offer.offerId)}
                          aria-label={`Offer at ${formatPrice(offer.price)}`}
                        />
                        <div style={{ flex: 1 }}>
                          <span className="price mono" style={{ fontSize: '1rem' }}>
                            {formatPrice(offer.price)}
                          </span>
                          <p className="caption">
                            {offer.stockQuantity > 0
                              ? `${offer.stockQuantity} units available`
                              : 'Out of stock'}
                          </p>
                        </div>
                        <div className="offer-actions">
                          <StockBadge stockQuantity={offer.stockQuantity} />
                          {offer.codEligible ? (
                            <StatusBadge status="CONFIRMED" label="COD available" />
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </section>

          {/* Reviews Section */}
          <SectionCard
            title="Customer reviews"
            description="Verified ratings from marketplace buyers."
          >
            {reviews.length ? (
              <div className="review-list">
                {reviews.map((review) => (
                  <article className="review-item" key={review.reviewId}>
                    <div className="review-header">
                      <span className="subheading">{review.buyerName}</span>
                      {review.isVerifiedPurchase ? <VerifiedBadge /> : null}
                    </div>
                    <p className="small">Rating: {review.rating} / 5</p>
                    <p className="body">{review.comment}</p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState message="No reviews yet for this product." />
            )}
          </SectionCard>
        </div>

        {/* Right Column: Buy Box Side Panel (20-24rem) */}
        <aside className="card detail-section" aria-labelledby="buy-box-title">
          <h2 className="heading" id="buy-box-title">
            Purchase options
          </h2>

          {activeOffer ? (
            <>
              <div>
                <p className="caption">Price</p>
                <p className="price mono" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  {formatPrice(activeOffer.price)}
                </p>
              </div>

              <div>
                <p className="caption">Selected variant</p>
                <p className="small">
                  <strong>
                    {selectedVariant?.size} · {selectedVariant?.colour}
                  </strong>
                </p>
              </div>

              <div className="offer-actions">
                <StockBadge stockQuantity={activeOffer.stockQuantity} />
                {activeOffer.codEligible ? (
                  <StatusBadge status="CONFIRMED" label="COD available" />
                ) : null}
              </div>

              <button
                className="btn btn-primary btn-lg"
                type="button"
                disabled={activeOffer.stockQuantity === 0 || busyOffer === activeOffer.offerId}
                onClick={() => handleAddToCart(activeOffer)}
                style={{ width: '100%' }}
              >
                {busyOffer === activeOffer.offerId
                  ? 'Adding to cart…'
                  : activeOffer.stockQuantity === 0
                  ? 'Out of stock'
                  : 'Add to cart'}
              </button>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={openWishlistPicker}
                style={{ width: '100%' }}
              >
                Save to wishlist
              </button>

              {wishlistPickerOpen ? (
                <div className="picker-panel">
                  <strong className="subheading">Save variant to wishlist</strong>
                  <label className="field">
                    <span className="field-label">Choose existing wishlist</span>
                    <select
                      className="input"
                      value={selectedWishlist}
                      onChange={(event) => setSelectedWishlist(event.target.value)}
                    >
                      <option value="">Select a wishlist</option>
                      {wishlists.map((w) => (
                        <option value={w.wishlistId} key={w.wishlistId}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="inline-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      type="button"
                      onClick={saveToWishlist}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      onClick={() => setWishlistPickerOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>

                  <label className="field" style={{ marginTop: 'var(--space-2)' }}>
                    <span className="field-label">Or new wishlist</span>
                    <input
                      className="input input-sm"
                      value={newWishlistName}
                      onChange={(event) => setNewWishlistName(event.target.value)}
                      placeholder="Wishlist name"
                    />
                  </label>
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    onClick={createAndSaveWishlist}
                  >
                    Create and save
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <p className="caption">Select a variant to view offer pricing and availability.</p>
          )}
        </aside>
      </div>
    </main>
  )
}
