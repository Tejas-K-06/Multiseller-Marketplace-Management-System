import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import Message from '../../components/Message'
import QuantityInput from '../../components/QuantityInput'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import formatPrice from '../../utils/formatPrice'
import { getCart, removeCartItem, updateCartItem } from '../../api/cartApi'

export default function CartPage() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyLine, setBusyLine] = useState(null)

  useEffect(() => {
    getCart()
      .then(setCart)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  async function changeQuantity(lineNo, quantity) {
    setBusyLine(lineNo)
    try {
      const updated = await updateCartItem(lineNo, { quantity })
      setCart(updated)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyLine(null)
    }
  }

  async function removeItem(lineNo) {
    setBusyLine(lineNo)
    try {
      const updated = await removeCartItem(lineNo)
      setCart(updated)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyLine(null)
    }
  }

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader overline="Buyer area" title="Cart" description="Review items and proceed to checkout." />
        <Skeleton count={2} />
      </main>
    )
  }

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Buyer area"
        title="Cart"
        description="Review quantities and proceed when your order is ready."
      />

      {error ? <Message>{error}</Message> : null}

      {!cart?.items?.length ? (
        <EmptyState
          message="Your cart is empty."
          action={
            <Link className="btn btn-primary" to="/products">
              Browse products
            </Link>
          }
        />
      ) : (
        <div className="two-column">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Store</th>
                  <th className="table-number">Price</th>
                  <th>Quantity</th>
                  <th className="table-number">Line total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.lineNo}>
                    <td data-label="Product">
                      <div>
                        <strong>{item.title}</strong>
                        <p className="caption">
                          {item.size} · {item.colour}
                        </p>
                      </div>
                    </td>
                    <td data-label="Store">
                      <span className="small">{item.storeName}</span>
                    </td>
                    <td data-label="Price" className="table-number mono">
                      {formatPrice(item.price)}
                    </td>
                    <td data-label="Quantity">
                      <QuantityInput
                        value={item.quantity}
                        max={item.stockQuantity}
                        onChange={(quantity) => changeQuantity(item.lineNo, quantity)}
                      />
                    </td>
                    <td data-label="Line total" className="table-number mono">
                      {formatPrice(item.lineTotal)}
                    </td>
                    <td data-label="Action">
                      <button
                        className="btn btn-secondary btn-sm"
                        type="button"
                        disabled={busyLine === item.lineNo}
                        onClick={() => removeItem(item.lineNo)}
                      >
                        {busyLine === item.lineNo ? 'Updating…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="card detail-section" aria-labelledby="cart-summary-title">
            <h2 className="heading" id="cart-summary-title">
              Order summary
            </h2>
            <dl className="summary-list">
              <div>
                <dt>Total items</dt>
                <dd className="mono">
                  {cart.items.reduce((acc, curr) => acc + curr.quantity, 0)}
                </dd>
              </div>
              <div>
                <dt>Estimated total</dt>
                <dd className="mono">
                  <strong className="price" style={{ fontSize: '1.25rem' }}>
                    {formatPrice(cart.estimatedTotal)}
                  </strong>
                </dd>
              </div>
            </dl>
            <Link className="btn btn-primary btn-lg" to="/checkout" style={{ width: '100%' }}>
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  )
}
