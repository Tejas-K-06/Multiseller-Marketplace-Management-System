import { useEffect, useState } from 'react'
import FormField from '../../components/FormField'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import PageHeader from '../../components/PageHeader'
import SectionCard from '../../components/SectionCard'
import EmptyState from '../../components/EmptyState'
import { createAdminCategory, getAdminCategories } from '../../api/adminApi'

function CategoryTree({ categories, parentId = null }) {
  const children = categories.filter((category) => category.parentId === parentId)
  if (children.length === 0) return null

  return (
    <ul className="tree-list">
      {children.map((category) => {
        const hasChildren = categories.some((child) => child.parentId === category.categoryId)
        return (
          <li key={category.categoryId} style={{ padding: 'var(--space-1) 0' }}>
            <span className="subheading" style={{ color: 'var(--navy)' }}>
              {category.name}
            </span>
            {hasChildren ? (
              <div className="tree-child">
                <CategoryTree categories={categories} parentId={category.categoryId} />
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getAdminCategories()
      .then(setCategories)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  async function submit(event) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Category name is required.')
      return
    }
    setSubmitting(true)
    try {
      await createAdminCategory({
        name: name.trim(),
        parentId: parentId ? Number(parentId) : undefined
      })
      const refreshed = await getAdminCategories()
      setCategories(refreshed)
      setName('')
      setParentId('')
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="page" id="main-content">
        <PageHeader overline="Admin area" title="Categories" description="Loading catalog groups…" />
        <Skeleton count={2} />
      </main>
    )
  }

  return (
    <main className="page" id="main-content">
      <PageHeader
        overline="Admin area"
        title="Categories"
        description="Organize the marketplace catalog into clear hierarchies and departments."
      />

      {error ? <Message>{error}</Message> : null}

      <div className="two-column">
        {/* Left Column: Indented Category Tree in SectionCard */}
        <SectionCard
          title="Category hierarchy"
          description={`${categories.length} total categories registered.`}
        >
          {categories.length ? (
            <CategoryTree categories={categories} />
          ) : (
            <EmptyState message="No categories defined yet." />
          )}
        </SectionCard>

        {/* Right Column: Create Form in SectionCard per Task 6 */}
        <SectionCard
          title="Create category"
          description="Add a top-level group or sub-category."
        >
          <form className="auth-form" onSubmit={submit}>
            <FormField label="Category name" id="category-name">
              <input
                className="input"
                id="category-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Footwear, Kitchen Appliances"
                required
              />
            </FormField>

            <FormField label="Parent category (optional)" id="parent-category">
              <select
                className="input"
                id="parent-category"
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
              >
                <option value="">Top-level category (no parent)</option>
                {categories.map((category) => (
                  <option value={category.categoryId} key={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting || !name.trim()}
              style={{ width: '100%' }}
            >
              {submitting ? 'Creating category…' : 'Create category'}
            </button>
          </form>
        </SectionCard>
      </div>
    </main>
  )
}
