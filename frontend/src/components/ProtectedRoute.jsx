import { Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p>Carregando...</p>
  if (!user) return <Navigate to="/entrar" replace />

  return children
}
