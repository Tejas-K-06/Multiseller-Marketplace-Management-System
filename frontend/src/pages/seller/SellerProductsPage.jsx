import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import StatusBadge from '../../components/StatusBadge'
import formatPrice from '../../utils/formatPrice'
import { getSellerProducts, updateOffer, updateSellerProduct } from '../../api/sellerApi'

export default function SellerProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  useEffect(() => { getSellerProducts().then(setProducts).catch((error) => setMessage(error.message)).finally(() => setLoading(false)) }, [])
  function editOffer(productId, variantId, offerId, name, value) { setProducts((current) => current.map((product) => product.productId === productId ? { ...product, variants: product.variants.map((variant) => variant.variantId === variantId ? { ...variant, offers: variant.offers.map((offer) => offer.offerId === offerId ? { ...offer, [name]: name === 'price' ? Number(value) : Number(value) } : offer) } : variant) } : product)) }
  async function saveOffer(offer) { try { await updateOffer(offer.offerId, { price: offer.price, stockQuantity: offer.stockQuantity }); setMessage('Offer updated.') } catch (error) { setMessage(error.message) } }
  async function toggleProduct(product) { const status = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'; try { await updateSellerProduct(product.productId, { status }); setProducts((current) => current.map((item) => item.productId === product.productId ? { ...item, status } : item)) } catch (error) { setMessage(error.message) } }
  if (loading) return <main className="page" id="main-content"><Skeleton count={2} /></main>
  return <main className="page" id="main-content"><div className="page-header"><div><p className="overline">Seller area</p><h1 className="title-lg">Products</h1></div><Link className="btn btn-primary" to="/seller/products/new">Add product</Link></div>{message ? <Message>{message}</Message> : null}{products.length ? <div className="content-stack">{products.map((product) => <section className="card product-editor" key={product.productId}><div className="inline-actions"><div><h2 className="heading">{product.title}</h2><p className="caption">{product.description}</p></div><div className="form-actions"><StatusBadge status={product.status} /><button className="btn btn-secondary" type="button" onClick={() => toggleProduct(product)}>{product.status === 'ACTIVE' ? 'Set inactive' : 'Set active'}</button><Link className="btn btn-ghost" to={`/seller/products/${product.productId}/edit`}>Edit</Link></div></div>{product.variants.map((variant) => <div className="variant-card" key={variant.variantId}><div className="variant-header"><span className="subheading">{variant.size} · {variant.colour}</span><span className="caption mono">{variant.sku}</span></div>{variant.offers.map((offer) => <div className="offer-edit" key={offer.offerId}><label className="field"><span className="field-label">Price</span><input className="input mono" type="number" min="0.01" value={offer.price} onChange={(event) => editOffer(product.productId, variant.variantId, offer.offerId, 'price', event.target.value)} /></label><label className="field"><span className="field-label">Stock</span><input className="input mono" type="number" min="0" value={offer.stockQuantity} onChange={(event) => editOffer(product.productId, variant.variantId, offer.offerId, 'stockQuantity', event.target.value)} /></label><button className="btn btn-secondary" type="button" onClick={() => saveOffer(offer)}>Save offer</button><span className="caption">{formatPrice(offer.price)} · {offer.stockQuantity} left</span></div>)}</div>)}</section>)}</div> : <EmptyState message="No products found." />}</main>
}
