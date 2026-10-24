import { useEffect, useState } from 'react'
import FormField from '../../components/FormField'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import { createAdminCategory, getAdminCategories } from '../../api/adminApi'

function CategoryTree({ categories, parentId = null }) { return <ul className="tree-list">{categories.filter((category) => category.parentId === parentId).map((category) => <li key={category.categoryId}><span className="subheading">{category.name}</span>{categories.some((child) => child.parentId === category.categoryId) ? <div className="tree-child"><CategoryTree categories={categories} parentId={category.categoryId} /></div> : null}</li>)}</ul> }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { getAdminCategories().then(setCategories).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)) }, [])
  async function submit(event) { event.preventDefault(); if (!name.trim()) { setError('Category name is required.'); return } try { await createAdminCategory({ name: name.trim(), parentId: parentId ? Number(parentId) : undefined }); setCategories(await getAdminCategories()); setName(''); setParentId(''); setError('') } catch (requestError) { setError(requestError.message) } }
  if (loading) return <main className="page" id="main-content"><Skeleton count={2} /></main>
  return <main className="page" id="main-content"><div className="page-header"><div><p className="overline">Admin area</p><h1 className="title-lg">Categories</h1></div></div>{error ? <Message>{error}</Message> : null}<div className="two-column"><section className="card detail-section" aria-labelledby="category-tree"><h2 className="heading" id="category-tree">Category tree</h2><CategoryTree categories={categories} /></section><form className="card auth-form" onSubmit={submit}><h2 className="heading">Create category</h2><FormField label="Name" id="category-name"><input className="input" id="category-name" value={name} onChange={(event) => setName(event.target.value)} /></FormField><FormField label="Parent category (optional)" id="parent-category"><select className="input" id="parent-category" value={parentId} onChange={(event) => setParentId(event.target.value)}><option value="">No parent</option>{categories.map((category) => <option value={category.categoryId} key={category.categoryId}>{category.name}</option>)}</select></FormField><button className="btn btn-primary" type="submit">Create category</button></form></div></main>
}
