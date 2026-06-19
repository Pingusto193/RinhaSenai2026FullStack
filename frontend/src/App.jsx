import { Routes, Route, useLocation } from 'react-router'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Ledger from './pages/Ledger.jsx'
import Account from './pages/Account.jsx'
import Friends from './pages/Friends.jsx'
import Transfer from './pages/Transfer.jsx'
import Invest from './pages/Invest.jsx'
import InvestChart from './pages/InvestChart.jsx'
import Expenses from './pages/Expenses.jsx'

export default function App() {
  const location = useLocation()

  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <div className="page-transition" key={location.pathname}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/entrar" element={<Login />} />
            <Route path="/criar" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/extrato" element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
            <Route path="/conta" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/amigos" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            <Route path="/transferir" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
            <Route path="/investir" element={<ProtectedRoute><Invest /></ProtectedRoute>} />
            <Route path="/investir/grafico" element={<ProtectedRoute><InvestChart /></ProtectedRoute>} />
            <Route path="/gastos" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
