import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import FormField from '../../components/FormField'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import formatPrice from '../../utils/formatPrice'
import { createWishlist, getWishlists, removeWishlistItem } from '../../api/wishlistApi'

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    getWishlists()
      .then(setWishlists)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(event) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Wishlist name is required.')
      return
    }
    setSubmitting(true)
    try {
      await createWishlist({ name: name.trim() })
      const lists = await getWishlists()
      setWishlists(lists)
      setName('')
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemove(wishlistId, variantId) {
    setRemoving(`${wishlistId}-${variantId}`)
    try {
      await removeWishlistItem(wishlistId, variantId)
      const lists = await getWishlists()
      setWishlists(lists)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setRemoving(null)
    }
  }

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader overline="Buyer area" title="Wishlists" description="Loading your saved lists…" />
        <Skeleton count={2} />
      </main>
    )
  }

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Buyer area"
        title="Wishlists"
        description="Organize product variants to revisit or purchase later."
      />

      {error ? <Message>{error}</Message> : null}

      <div className="two-column">
        {/* Wishlists Display */}
        <div className="content-stack">
          {wishlists.length ? (
            wishlists.map((wishlist) => (
              <SectionCard
                key={wishlist.wishlistId}
                title={wishlist.name}
                description={`${wishlist.items.length} ${
                  wishlist.items.length === 1 ? 'item' : 'items'
                }`}
              >
                {wishlist.items.length ? (
                  <div className="stack-list">
                    {wishlist.items.map((item) => (
                      <div className="wishlist-item" key={item.variantId}>
                        <div>
                          <Link className="subheading" to={`/products/${item.productId}`}>
                            {item.title}
                          </Link>
                          <p className="caption">
                            {item.size} · {item.colour} ·{' '}
                            <span className="mono">From {formatPrice(item.fromPrice)}</span>
                          </p>
                        </div>
                        <div className="inline-actions">
                          <Link
                            className="btn btn-ghost btn-sm"
                            to={`/products/${item.productId}`}
                          >
                            View
                          </Link>
                          <button
                            className="btn btn-secondary btn-sm"
                            type="button"
                            disabled={removing === `${wishlist.wishlistId}-${item.variantId}`}
                            onClick={() => handleRemove(wishlist.wishlistId, item.variantId)}
                          >
                            {removing === `${wishlist.wishlistId}-${item.variantId}`
                              ? 'Removing…'
                              : 'Remove'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="This wishlist is empty." />
                )}
              </SectionCard>
            ))
          ) : (
            <EmptyState message="No wishlists created yet. Create one on the right to save products." />
          )}
        </div>

        {/* Create Wishlist Form Panel */}
        <aside className="card detail-section" aria-labelledby="create-wishlist-heading">
          <h2 className="heading" id="create-wishlist-heading">
            Create a wishlist
          </h2>
          <form className="auth-form" onSubmit={handleCreate}>
            <FormField label="Wishlist name" id="wishlist-name">
              <input
                className="input"
                id="wishlist-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Birthday gifts, Work gear"
              />
            </FormField>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting || !name.trim()}
            >
              {submitting ? 'Creating list…' : 'Create wishlist'}
            </button>
          </form>
        </aside>
      </div>
    </main>
  )
}
