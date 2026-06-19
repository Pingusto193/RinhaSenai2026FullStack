import { NavLink, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import BrandMark from './BrandMark.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

  return (
    <header className="navbar">
      <NavLink to={user ? '/dashboard' : '/'} className="navbar-brand">
        <BrandMark />
        Flinx
      </NavLink>
      <nav className="navbar-links">
        {user ? (
          <>
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/transferir" className={linkClass}>Transferir</NavLink>
            <NavLink to="/investir" className={linkClass}>Investir</NavLink>
            <NavLink to="/gastos" className={linkClass}>Gastos</NavLink>
            <NavLink to="/amigos" className={linkClass}>Amigos</NavLink>
            <NavLink to="/conta" className={linkClass}>Conta</NavLink>
            <button type="button" className="btn-secondary" onClick={handleLogout}>Sair</button>
          </>
        ) : (
          <>
            <NavLink to="/entrar" className={linkClass}>Entrar</NavLink>
            <NavLink to="/criar" className="nav-link primary">Criar conta</NavLink>
          </>
        )}
      </nav>
    </header>
  )
}
