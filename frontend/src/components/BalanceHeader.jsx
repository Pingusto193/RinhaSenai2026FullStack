import { useAuth } from '../context/AuthContext.jsx'
import HideableBalance from './HideableBalance.jsx'

export default function BalanceHeader() {
  const { user } = useAuth()

  return (
    <div className="balance-header">
      <span>Saldo</span>
      <HideableBalance valueCents={user?.balanceCents ?? 0} />
    </div>
  )
}
