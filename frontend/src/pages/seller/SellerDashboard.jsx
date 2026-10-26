import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import SectionCard from '../../components/SectionCard'
import EmptyState from '../../components/EmptyState'
import { StockBadge } from '../../components/StatusBadge'
import formatPrice from '../../utils/formatPrice'
import { getSellerDashboard, getSellerProducts } from '../../api/sellerApi'

export default function SellerDashboard() {
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getSellerDashboard(), getSellerProducts()])
      .then(([dashboardStats, sellerProducts]) => {
        setStats(dashboardStats)
        setProducts(sellerProducts)
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader
          overline="Seller area"
          title="Dashboard"
          description="Loading catalog and fulfilment workload…"
        />
        <Skeleton count={3} />
      </main>
    )
  }

  // Extract low-stock offers (< 10 units)
  const lowStockItems = products.flatMap((product) =>
    product.variants.flatMap((variant) =>
      variant.offers
        .filter((offer) => offer.stockQuantity < 10)
        .map((offer) => ({
          productId: product.productId,
          productTitle: product.title,
          sku: variant.sku,
          size: variant.size,
          colour: variant.colour,
          price: offer.price,
          stockQuantity: offer.stockQuantity,
          offerId: offer.offerId
        }))
    )
  )

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Seller area"
        title="Dashboard"
        description="A quick view of your catalog performance and fulfilment workload."
        action={
          <Link className="btn btn-primary btn-sm" to="/seller/products/new">
            Add new product
          </Link>
        }
      />

      {error ? <Message>{error}</Message> : null}

      {/* StatCards in responsive grid */}
      {stats ? (
        <div className="dashboard-grid">
          <StatCard
            label="Total products"
            value={stats.products}
            detail="Active and draft listings"
          />
          <StatCard
            label="Pending sub-orders"
            value={stats.pendingSubOrders}
            detail="Awaiting confirmation or dispatch"
          />
          <StatCard
            label="Low-stock offers"
            value={stats.lowStockOffers}
            detail="Offers with under 10 units"
          />
        </div>
      ) : null}

      {/* Low-stock list per Task 5 */}
      <SectionCard
        title="Low stock alerts"
        description="Offers with fewer than 10 units remaining in inventory."
        action={
          <Link className="small" to="/seller/products">
            Manage all products →
          </Link>
        }
      >
        {lowStockItems.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th className="table-number">Price</th>
                  <th className="table-number">Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={`${item.productId}-${item.offerId}`}>
                    <td data-label="Product">
                      <strong>{item.productTitle}</strong>
                      <p className="caption">
                        {item.size} · {item.colour}
                      </p>
                    </td>
                    <td data-label="SKU" className="mono">
                      {item.sku}
                    </td>
                    <td data-label="Price" className="table-number mono">
                      {formatPrice(item.price)}
                    </td>
                    <td data-label="Stock" className="table-number mono">
                      {item.stockQuantity}
                    </td>
                    <td data-label="Status">
                      <StockBadge stockQuantity={item.stockQuantity} />
                    </td>
                    <td data-label="Action">
                      <Link
                        className="btn btn-secondary btn-sm"
                        to={`/seller/products/${item.productId}/edit`}
                      >
                        Update stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="All product offers have sufficient stock (10+ units)." />
        )}
      </SectionCard>
    </main>
  )
}
