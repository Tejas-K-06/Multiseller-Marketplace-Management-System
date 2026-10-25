import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function homeForRole(role) {
  if (role === 'SELLER') return '/seller'
  if (role === 'ADMIN') return '/admin/sellers'
  return '/'
}

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <main className="page"><p className="body">Loading…</p></main>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={homeForRole(user.role)} replace />
  }

  return <Outlet />
}
