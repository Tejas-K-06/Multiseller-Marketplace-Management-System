import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FormField from '../../components/FormField'
import Message from '../../components/Message'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import Skeleton from '../../components/Skeleton'
import formatPrice from '../../utils/formatPrice'
import { getCategories } from '../../api/categoryApi'
import {
  addVariant,
  createOffer,
  createSellerProduct,
  getSellerProducts,
  updateSellerProduct
} from '../../api/sellerApi'

const blankVariant = {
  sku: '',
  size: '',
  colour: '',
  weightKg: '',
  price: '',
  stockQuantity: '',
  codEligible: true
}

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [values, setValues] = useState({ categoryId: '', title: '', description: '' })
  const [variants, setVariants] = useState([])
  const [draft, setDraft] = useState(blankVariant)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((requestError) => setError(requestError.message))

    if (id) {
      getSellerProducts()
        .then((products) => {
          const product = products.find((item) => item.productId === Number(id))
          if (product) {
            setValues({
              categoryId: product.categoryId,
              title: product.title,
              description: product.description
            })
            setVariants(product.variants)
          }
        })
        .catch((requestError) => setError(requestError.message))
        .finally(() => setLoading(false))
    }
  }, [id])

  function update(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function addDraftVariant() {
    if (!draft.sku.trim()) {
      setError('SKU is required for a new variant.')
      return
    }
    if (draft.price === '' || Number(draft.price) <= 0) {
      setError('Offer price must be greater than 0.')
      return
    }
    if (draft.stockQuantity === '' || Number(draft.stockQuantity) < 0) {
      setError('Stock cannot be negative.')
      return
    }

    setVariants((current) => [
      ...current,
      {
        ...draft,
        variantId: `draft-${current.length}`,
        offers: [
          {
            price: Number(draft.price),
            stockQuantity: Number(draft.stockQuantity),
            codEligible: draft.codEligible
          }
        ]
      }
    ])
    setDraft(blankVariant)
    setError('')
  }

  async function submit(event) {
    event.preventDefault()
    if (!values.categoryId || !values.title.trim()) {
      setError('Category and title are required.')
      return
    }
    if (!id && !variants.length) {
      setError('Please add at least one variant and offer.')
      return
    }

    setSubmitting(true)
    try {
      let productId = Number(id)
      if (id) {
        await updateSellerProduct(id, {
          categoryId: Number(values.categoryId),
          title: values.title,
          description: values.description
        })
      } else {
        const res = await createSellerProduct({
          categoryId: Number(values.categoryId),
          title: values.title,
          description: values.description
        })
        productId = res.productId
      }

      for (const variant of variants.filter((item) => !Number.isInteger(item.variantId))) {
        const created = await addVariant(productId, {
          sku: variant.sku,
          size: variant.size,
          colour: variant.colour,
          weightKg: Number(variant.weightKg) || 0
        })
        await createOffer(created.variantId, {
          price: Number(variant.offers[0].price),
          stockQuantity: Number(variant.offers[0].stockQuantity),
          codEligible: variant.offers[0].codEligible
        })
      }
      navigate('/seller/products')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader
          overline="Seller area"
          title={id ? 'Edit product' : 'Add product'}
          description="Loading product details…"
        />
        <Skeleton count={2} />
      </main>
    )
  }

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Seller area"
        title={id ? 'Edit product' : 'Add new product'}
        description="Describe the item, assign a category, and configure offers for inventory."
      />

      {error ? <Message>{error}</Message> : null}

      <form className="content-stack" onSubmit={submit}>
        {/* Section 1: Product Information */}
        <SectionCard
          title="General information"
          description="Basic product title, catalog category, and description."
        >
          <div className="form-grid">
            <FormField label="Category" id="categoryId">
              <select
                className="input"
                id="categoryId"
                name="categoryId"
                value={values.categoryId}
                onChange={update}
                required
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option value={c.categoryId} key={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Product title" id="title">
              <input
                className="input"
                id="title"
                name="title"
                value={values.title}
                onChange={update}
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                required
              />
            </FormField>
          </div>

          <FormField label="Description" id="description">
            <textarea
              className="input"
              id="description"
              name="description"
              rows="3"
              value={values.description}
              onChange={update}
              placeholder="Provide a clear description for buyers…"
            />
          </FormField>
        </SectionCard>

        {/* Section 2: Variants and Offers */}
        <SectionCard
          title="Variants and inventory"
          description="Manage SKU identifiers, pricing, and stock quantities."
        >
          {/* Existing variants */}
          {variants.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Size & Colour</th>
                    <th>Weight</th>
                    <th className="table-number">Price</th>
                    <th className="table-number">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.variantId}>
                      <td data-label="SKU" className="mono">
                        {v.sku}
                      </td>
                      <td data-label="Size & Colour">
                        {v.size || '—'} · {v.colour || '—'}
                      </td>
                      <td data-label="Weight" className="mono">
                        {v.weightKg ? `${v.weightKg} kg` : '—'}
                      </td>
                      <td data-label="Price" className="table-number mono">
                        {v.offers?.[0] ? formatPrice(v.offers[0].price) : '—'}
                      </td>
                      <td data-label="Stock" className="table-number mono">
                        {v.offers?.[0] ? v.offers[0].stockQuantity : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="caption">No variants added yet. Add one below.</p>
          )}

          {/* Add Variant Subform */}
          <div className="card detail-section" style={{ background: 'var(--subtle)' }}>
            <h3 className="subheading">Add a variant & offer</h3>
            <div className="form-grid">
              <FormField label="SKU" id="variant-sku">
                <input
                  className="input mono"
                  id="variant-sku"
                  value={draft.sku}
                  onChange={(e) =>
                    setDraft((current) => ({ ...current, sku: e.target.value }))
                  }
                  placeholder="e.g. HDPH-BLK-01"
                />
              </FormField>

              <FormField label="Size (optional)" id="variant-size">
                <input
                  className="input"
                  id="variant-size"
                  value={draft.size}
                  onChange={(e) =>
                    setDraft((current) => ({ ...current, size: e.target.value }))
                  }
                  placeholder="e.g. M, 128GB, Standard"
                />
              </FormField>

              <FormField label="Colour (optional)" id="variant-colour">
                <input
                  className="input"
                  id="variant-colour"
                  value={draft.colour}
                  onChange={(e) =>
                    setDraft((current) => ({ ...current, colour: e.target.value }))
                  }
                  placeholder="e.g. Black, Navy, White"
                />
              </FormField>

              <FormField label="Weight in kg (optional)" id="variant-weight">
                <input
                  className="input"
                  id="variant-weight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={draft.weightKg}
                  onChange={(e) =>
                    setDraft((current) => ({ ...current, weightKg: e.target.value }))
                  }
                  placeholder="0.25"
                />
              </FormField>

              <FormField label="Offer price (₹)" id="offer-price">
                <input
                  className="input mono"
                  id="offer-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={draft.price}
                  onChange={(e) =>
                    setDraft((current) => ({ ...current, price: e.target.value }))
                  }
                  placeholder="999.00"
                />
              </FormField>

              <FormField label="Stock quantity" id="offer-stock">
                <input
                  className="input mono"
                  id="offer-stock"
                  type="number"
                  min="0"
                  value={draft.stockQuantity}
                  onChange={(e) =>
                    setDraft((current) => ({ ...current, stockQuantity: e.target.value }))
                  }
                  placeholder="25"
                />
              </FormField>
            </div>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input
                type="checkbox"
                checked={draft.codEligible}
                onChange={(e) =>
                  setDraft((current) => ({ ...current, codEligible: e.target.checked }))
                }
              />
              <span className="small">Cash on delivery eligible</span>
            </label>

            <div>
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={addDraftVariant}
              >
                Add variant to product
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Action Bar */}
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving product…' : id ? 'Update product' : 'Save product'}
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => navigate('/seller/products')}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  )
}
