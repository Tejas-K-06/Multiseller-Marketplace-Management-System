import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import StatusBadge, { StockBadge } from '../../components/StatusBadge'
import formatPrice from '../../utils/formatPrice'
import { getSellerProducts, updateOffer, updateSellerProduct } from '../../api/sellerApi'

export default function SellerProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [savingOffer, setSavingOffer] = useState(null)
  const [togglingProduct, setTogglingProduct] = useState(null)
  // Track editing state per offer: { [offerId]: { price, stockQuantity } }
  const [editingOffers, setEditingOffers] = useState({})

  useEffect(() => {
    getSellerProducts()
      .then(setProducts)
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false))
  }, [])

  function startEdit(offer) {
    setEditingOffers((current) => ({
      ...current,
      [offer.offerId]: { price: offer.price, stockQuantity: offer.stockQuantity }
    }))
  }

  function cancelEdit(offerId) {
    setEditingOffers((current) => {
      const next = { ...current }
      delete next[offerId]
      return next
    })
  }

  function handleDraftChange(offerId, field, value) {
    setEditingOffers((current) => ({
      ...current,
      [offerId]: {
        ...(current[offerId] || {}),
        [field]: Number(value)
      }
    }))
  }

  async function saveOffer(offer) {
    const draft = editingOffers[offer.offerId] || offer
    setSavingOffer(offer.offerId)
    try {
      await updateOffer(offer.offerId, {
        price: draft.price,
        stockQuantity: draft.stockQuantity
      })
      setProducts((current) =>
        current.map((p) => ({
          ...p,
          variants: p.variants.map((v) => ({
            ...v,
            offers: v.offers.map((o) =>
              o.offerId === offer.offerId
                ? { ...o, price: draft.price, stockQuantity: draft.stockQuantity }
                : o
            )
          }))
        }))
      )
      cancelEdit(offer.offerId)
      setMessage('Offer pricing and stock updated.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSavingOffer(null)
    }
  }

  async function toggleProduct(product) {
    const nextStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setTogglingProduct(product.productId)
    try {
      await updateSellerProduct(product.productId, { status: nextStatus })
      setProducts((current) =>
        current.map((item) =>
          item.productId === product.productId ? { ...item, status: nextStatus } : item
        )
      )
      setMessage(`Product marked as ${nextStatus.toLowerCase()}.`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setTogglingProduct(null)
    }
  }

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader overline="Seller area" title="Products" description="Loading catalog listings…" />
        <Skeleton count={3} />
      </main>
    )
  }

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Seller area"
        title="Products"
        description="Manage your store catalog, offer prices, inventory, and visibility."
        action={
          <Link className="btn btn-primary" to="/seller/products/new">
            Add new product
          </Link>
        }
      />

      {message ? <Message>{message}</Message> : null}

      {products.length ? (
        <div className="content-stack">
          {products.map((product) => (
            <SectionCard
              key={product.productId}
              title={product.title}
              description={product.description}
              action={
                <div className="inline-actions">
                  <StatusBadge status={product.status} />
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    disabled={togglingProduct === product.productId}
                    onClick={() => toggleProduct(product)}
                  >
                    {togglingProduct === product.productId
                      ? 'Saving…'
                      : product.status === 'ACTIVE'
                      ? 'Set inactive'
                      : 'Set active'}
                  </button>
                  <Link
                    className="btn btn-ghost btn-sm"
                    to={`/seller/products/${product.productId}/edit`}
                  >
                    Edit details
                  </Link>
                </div>
              }
            >
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Variant / SKU</th>
                      <th>Size & Colour</th>
                      <th className="table-number">Price</th>
                      <th className="table-number">Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.flatMap((variant) =>
                      variant.offers.map((offer) => {
                        const isEditing = Boolean(editingOffers[offer.offerId])
                        const draft = editingOffers[offer.offerId] || {}
                        return (
                          <tr key={offer.offerId}>
                            <td data-label="Variant / SKU" className="mono">
                              <strong>{variant.sku}</strong>
                            </td>
                            <td data-label="Size & Colour">
                              {variant.size} · {variant.colour}
                            </td>
                            <td data-label="Price" className="table-number mono">
                              {isEditing ? (
                                <input
                                  className="input input-sm mono"
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={draft.price ?? offer.price}
                                  onChange={(e) =>
                                    handleDraftChange(offer.offerId, 'price', e.target.value)
                                  }
                                  style={{ maxWidth: '7rem', marginLeft: 'auto' }}
                                />
                              ) : (
                                formatPrice(offer.price)
                              )}
                            </td>
                            <td data-label="Stock" className="table-number mono">
                              {isEditing ? (
                                <input
                                  className="input input-sm mono"
                                  type="number"
                                  min="0"
                                  value={draft.stockQuantity ?? offer.stockQuantity}
                                  onChange={(e) =>
                                    handleDraftChange(
                                      offer.offerId,
                                      'stockQuantity',
                                      e.target.value
                                    )
                                  }
                                  style={{ maxWidth: '5rem', marginLeft: 'auto' }}
                                />
                              ) : (
                                offer.stockQuantity
                              )}
                            </td>
                            <td data-label="Status">
                              <StockBadge stockQuantity={offer.stockQuantity} />
                              {offer.codEligible ? (
                                <span className="caption" style={{ marginLeft: 'var(--space-1)' }}>
                                  COD
                                </span>
                              ) : null}
                            </td>
                            <td data-label="Actions">
                              {isEditing ? (
                                <div className="inline-actions">
                                  <button
                                    className="btn btn-primary btn-sm"
                                    type="button"
                                    disabled={savingOffer === offer.offerId}
                                    onClick={() => saveOffer(offer)}
                                  >
                                    {savingOffer === offer.offerId ? 'Saving…' : 'Save'}
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    type="button"
                                    disabled={savingOffer === offer.offerId}
                                    onClick={() => cancelEdit(offer.offerId)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  type="button"
                                  onClick={() => startEdit(offer)}
                                >
                                  Edit offer
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState
          message="No products found in your catalog."
          action={
            <Link className="btn btn-primary btn-sm" to="/seller/products/new">
              Add your first product
            </Link>
          }
        />
      )}
    </main>
  )
}
