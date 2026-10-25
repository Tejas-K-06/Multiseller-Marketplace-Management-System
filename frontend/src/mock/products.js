export const mockCategories = [
  { categoryId: 1, name: 'Electronics', parentId: null },
  { categoryId: 2, name: 'Fashion', parentId: null },
  { categoryId: 3, name: 'Mobiles', parentId: 1 },
  { categoryId: 4, name: 'T-Shirts', parentId: 2 }
]

export const mockProductDetails = [
  {
    productId: 1,
    title: 'Nova X Smartphone',
    description: '6.5 inch display, 5000 mAh battery',
    categoryName: 'Mobiles',
    storeName: 'TechHub',
    avgRating: 5.0,
    reviewCount: 1,
    variants: [
      { variantId: 1, sku: 'NOVA-128-BLK', size: '128GB', colour: 'Black', offers: [{ offerId: 1, sellerId: 2, price: 14999.00, stockQuantity: 25, codEligible: true }] },
      { variantId: 2, sku: 'NOVA-256-BLU', size: '256GB', colour: 'Blue', offers: [{ offerId: 2, sellerId: 2, price: 17999.00, stockQuantity: 15, codEligible: true }] }
    ]
  },
  {
    productId: 2,
    title: 'Cotton Round Neck T-Shirt',
    description: '100% cotton, regular fit',
    categoryName: 'T-Shirts',
    storeName: 'Fashionly',
    avgRating: 4.2,
    reviewCount: 8,
    variants: [
      { variantId: 3, sku: 'TSH-M-RED', size: 'M', colour: 'Red', offers: [{ offerId: 3, sellerId: 3, price: 499.00, stockQuantity: 100, codEligible: true }] },
      { variantId: 4, sku: 'TSH-L-BLK', size: 'L', colour: 'Black', offers: [{ offerId: 4, sellerId: 3, price: 499.00, stockQuantity: 80, codEligible: true }] }
    ]
  },
  {
    productId: 3,
    title: 'Wireless Earbuds',
    description: 'Bluetooth 5.3, 20 hour battery',
    categoryName: 'Electronics',
    storeName: 'TechHub',
    avgRating: 4.5,
    reviewCount: 12,
    variants: [
      { variantId: 5, sku: 'EAR-STD-WHT', size: 'Standard', colour: 'White', offers: [{ offerId: 5, sellerId: 2, price: 1999.00, stockQuantity: 50, codEligible: true }] }
    ]
  }
]

export const mockProductReviews = {
  1: [{ reviewId: 1, buyerName: 'Rahul Patil', rating: 5, comment: 'Great phone, fast delivery', isVerifiedPurchase: true }],
  2: [],
  3: []
}

function isInCategory(product, categoryId) {
  if (!categoryId) return true
  const categoryIds = product.variants.flatMap(() => {
    const category = mockCategories.find((item) => item.name === product.categoryName)
    return category ? [category.categoryId] : []
  })
  const selected = Number(categoryId)
  const children = mockCategories.filter((category) => category.parentId === selected).map((category) => category.categoryId)
  return categoryIds.some((id) => id === selected || children.includes(id))
}

function toListItem(product) {
  const prices = product.variants.flatMap((variant) => variant.offers.map((offer) => offer.price))
  return {
    productId: product.productId,
    title: product.title,
    categoryName: product.categoryName,
    storeName: product.storeName,
    fromPrice: Math.min(...prices),
    avgRating: product.avgRating,
    reviewCount: product.reviewCount
  }
}

export function mockListProducts({ q = '', categoryId, page = 1, limit = 12 } = {}) {
  const query = q.trim().toLowerCase()
  const filtered = mockProductDetails.filter((product) => {
    const matchesQuery = !query || `${product.title} ${product.storeName}`.toLowerCase().includes(query)
    return matchesQuery && isInCategory(product, categoryId)
  })
  const start = (page - 1) * limit
  return { items: filtered.slice(start, start + limit).map(toListItem), page, total: filtered.length }
}

export function mockGetProduct(productId) {
  return mockProductDetails.find((product) => product.productId === Number(productId)) || null
}
