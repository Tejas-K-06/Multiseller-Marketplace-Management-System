import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import Message from '../../components/Message'
import QuantityInput from '../../components/QuantityInput'
import Skeleton from '../../components/Skeleton'
import formatPrice from '../../utils/formatPrice'
import { getCart, removeCartItem, updateCartItem } from '../../api/cartApi'

export default function CartPage() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { getCart().then(setCart).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)) }, [])
  async function changeQuantity(lineNo, quantity) { try { setCart(await updateCartItem(lineNo, { quantity })); setError('') } catch (requestError) { setError(requestError.message) } }
  async function removeItem(lineNo) { try { setCart(await removeCartItem(lineNo)); setError('') } catch (requestError) { setError(requestError.message) } }

  if (loading) return <main className="page" id="main-content"><Skeleton count={2} /></main>
  return <main className="page" id="main-content"><div className="page-header"><div><p className="overline">Buyer area</p><h1 className="title-lg">Cart</h1></div></div>{error ? <Message>{error}</Message> : null}{!cart?.items.length ? <EmptyState message="Your cart is empty." action={<Link className="btn btn-primary" to="/products">Browse products</Link>} /> : <div className="two-column"><div className="table-wrap"><table><thead><tr><th>Product</th><th>Store</th><th className="table-number">Price</th><th>Quantity</th><th className="table-number">Line total</th><th>Action</th></tr></thead><tbody>{cart.items.map((item) => <tr key={item.lineNo}><td data-label="Product"><span><strong>{item.title}</strong><br /><span className="caption">{item.size} · {item.colour}</span></span></td><td data-label="Store">{item.storeName}</td><td data-label="Price" className="table-number mono">{formatPrice(item.price)}</td><td data-label="Quantity"><QuantityInput value={item.quantity} max={item.stockQuantity} onChange={(quantity) => changeQuantity(item.lineNo, quantity)} /></td><td data-label="Line total" className="table-number mono">{formatPrice(item.lineTotal)}</td><td data-label="Action"><button className="btn btn-secondary" type="button" onClick={() => removeItem(item.lineNo)}>Remove</button></td></tr>)}</tbody></table></div><aside className="card detail-section"><h2 className="heading">Order summary</h2><p className="inline-actions"><span>Estimated total</span><strong className="mono">{formatPrice(cart.estimatedTotal)}</strong></p><Link className="btn btn-primary" to="/checkout">Proceed to checkout</Link></aside></div>}</main>
}
