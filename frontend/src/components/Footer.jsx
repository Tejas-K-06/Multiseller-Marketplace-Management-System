import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner small">
        <span>Multi-Seller Marketplace Management System</span>
        <nav aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/login">Sign in</Link>
        </nav>
      </div>
    </footer>
  )
}
