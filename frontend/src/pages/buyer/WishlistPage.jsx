import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import FormField from '../../components/FormField'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import formatPrice from '../../utils/formatPrice'
import { createWishlist, getWishlists, removeWishlistItem } from '../../api/wishlistApi'

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { getWishlists().then(setWishlists).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)) }, [])
  async function handleCreate(event) { event.preventDefault(); if (!name.trim()) { setError('Wishlist name is required.'); return } try { await createWishlist({ name: name.trim() }); setWishlists(await getWishlists()); setName(''); setError('') } catch (requestError) { setError(requestError.message) } }
  async function handleRemove(wishlistId, variantId) { try { await removeWishlistItem(wishlistId, variantId); setWishlists(await getWishlists()) } catch (requestError) { setError(requestError.message) } }
  if (loading) return <main className="page" id="main-content"><Skeleton count={2} /></main>
  return <main className="page" id="main-content"><div className="page-header"><div><p className="overline">Buyer area</p><h1 className="title-lg">Wishlists</h1></div></div>{error ? <Message>{error}</Message> : null}<form className="card auth-form" onSubmit={handleCreate}><FormField label="New wishlist name" id="wishlist-name"><input className="input" id="wishlist-name" value={name} onChange={(event) => setName(event.target.value)} /><button className="btn btn-secondary" type="submit">Create wishlist</button></FormField></form>{wishlists.length ? <div className="wishlist-grid">{wishlists.map((wishlist) => <section className="card" key={wishlist.wishlistId} aria-labelledby={`wishlist-${wishlist.wishlistId}`}><h2 className="heading" id={`wishlist-${wishlist.wishlistId}`}>{wishlist.name}</h2>{wishlist.items.length ? wishlist.items.map((item) => <div className="wishlist-item" key={item.variantId}><div><Link className="subheading" to={`/products/${item.productId}`}>{item.title}</Link><p className="caption">{item.size} · {item.colour} · <span className="mono">From {formatPrice(item.fromPrice)}</span></p></div><div className="inline-actions"><Link className="btn btn-ghost" to={`/products/${item.productId}`}>View product</Link><button className="btn btn-secondary" type="button" onClick={() => handleRemove(wishlist.wishlistId, item.variantId)}>Remove</button></div></div>) : <EmptyState message="This wishlist is empty." />}</section>)}</div> : <EmptyState message="Create a wishlist to save product variants." />}</main>
}
