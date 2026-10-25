import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import HomePage from './pages/buyer/HomePage'
import ProductListPage from './pages/buyer/ProductListPage'
import ProductDetailPage from './pages/buyer/ProductDetailPage'
import CartPage from './pages/buyer/CartPage'
import WishlistPage from './pages/buyer/WishlistPage'
import CheckoutPage from './pages/buyer/CheckoutPage'
import OrdersPage from './pages/buyer/OrdersPage'
import OrderDetailPage from './pages/buyer/OrderDetailPage'
import AddressPage from './pages/buyer/AddressPage'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerProductsPage from './pages/seller/SellerProductsPage'
import ProductFormPage from './pages/seller/ProductFormPage'
import SellerOrdersPage from './pages/seller/SellerOrdersPage'
import AdminSellersPage from './pages/admin/AdminSellersPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminCouponsPage from './pages/admin/AdminCouponsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute role="BUYER" />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/addresses" element={<AddressPage />} />
        </Route>

        <Route element={<ProtectedRoute role="SELLER" />}>
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProductsPage />} />
          <Route path="/seller/products/new" element={<ProductFormPage />} />
          <Route path="/seller/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/seller/orders" element={<SellerOrdersPage />} />
        </Route>

        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="/admin/sellers" element={<AdminSellersPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/coupons" element={<AdminCouponsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
