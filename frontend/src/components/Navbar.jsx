import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const publicLinks = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' }
]

const roleLinks = {
  BUYER: [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
    { label: 'Cart', to: '/cart' },
    { label: 'Wishlists', to: '/wishlist' },
    { label: 'Orders', to: '/orders' },
    { label: 'Addresses', to: '/addresses' }
  ],
  SELLER: [
    { label: 'Dashboard', to: '/seller' },
    { label: 'Products', to: '/seller/products' },
    { label: 'Orders', to: '/seller/orders' }
  ],
  ADMIN: [
    { label: 'Sellers', to: '/admin/sellers' },
    { label: 'Categories', to: '/admin/categories' },
    { label: 'Coupons', to: '/admin/coupons' },
    { label: 'Orders', to: '/admin/orders' }
  ]
}

function linkClass({ isActive }) {
  return `nav-link${isActive ? ' active' : ''}`
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const links = user ? roleLinks[user.role] : publicLinks

  function closeMenu() {
    setMenuOpen(false)
  }

  function handleLogout() {
    logout()
    closeMenu()
    navigate('/login')
  }

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="nav-bar">
        <NavLink className="wordmark" to="/" onClick={closeMenu}>Multi-Seller Marketplace</NavLink>

        <nav className="nav-links" aria-label="Primary navigation">
          {links.map((link) => <NavLink key={link.to} className={linkClass} to={link.to} end={link.to === '/'}>{link.label}</NavLink>)}
        </nav>

        <div className="nav-actions">
          {user ? (
            <button className="btn btn-secondary" type="button" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <NavLink className="btn btn-ghost" to="/login">Login</NavLink>
              <NavLink className="btn btn-primary" to="/register">Register</NavLink>
            </>
          )}
        </div>

        <button
          className="nav-toggle"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {menuOpen ? (
        <nav className="nav-panel" id="mobile-navigation" aria-label="Mobile navigation">
          {links.map((link) => <NavLink key={link.to} className={linkClass} to={link.to} end={link.to === '/'} onClick={closeMenu}>{link.label}</NavLink>)}
          {user ? (
            <button className="btn btn-secondary" type="button" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <NavLink className="btn btn-ghost" to="/login" onClick={closeMenu}>Login</NavLink>
              <NavLink className="btn btn-primary" to="/register" onClick={closeMenu}>Register</NavLink>
            </>
          )}
        </nav>
      ) : null}
    </header>
  )
}
