import { mockCategories } from './products'
import { getMockCoupons, mockCreateCoupon } from './coupons'
import { getMockOrders } from './orders'

let sellers = [
  { userId: 2, storeName: 'TechHub', email: 'techhub@mkt.com', taxId: '27AAAAA0000A1Z5', approvalStatus: 'APPROVED' },
  { userId: 3, storeName: 'Fashionly', email: 'fashionly@mkt.com', taxId: '27BBBBB0000B1Z5', approvalStatus: 'APPROVED' },
  { userId: 7, storeName: 'QuickCart', email: 'quickcart@mkt.com', taxId: '27CCCCCC0000C1Z5', approvalStatus: 'PENDING' }
]
let categories = mockCategories.map((category) => ({ ...category }))

export function getMockSellers(status) { return sellers.filter((seller) => !status || seller.approvalStatus === status).map((seller) => ({ ...seller })) }
export function mockSetSellerApproval(sellerId, status) { const seller = sellers.find((item) => item.userId === Number(sellerId)); if (!seller) throw new Error('Seller not found'); seller.approvalStatus = status; return { userId: seller.userId, approvalStatus: seller.approvalStatus } }
export function getMockAdminCategories() { return categories.map((category) => ({ ...category })) }
export function mockCreateCategory(data) { const category = { categoryId: categories.length + 1, name: data.name, parentId: data.parentId ? Number(data.parentId) : null }; categories.push(category); return { categoryId: category.categoryId } }
export function getMockAdminOrders() { return getMockOrders().map((order) => ({ ...order, buyerName: order.orderId === 1 ? 'Rahul Patil' : 'Sneha Joshi' })) }
export function getMockAdminStats() { return { users: 6, sellers: 2, products: 3, orders: 2, revenue: 14397.30, topSellers: [{ storeName: 'TechHub', revenue: 14999.00 }, { storeName: 'Fashionly', revenue: 998.00 }] } }
export { getMockCoupons, mockCreateCoupon }
