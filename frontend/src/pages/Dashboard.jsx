import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { getDashboard } from '../api/dashboard.js'
import HideableBalance, { formatCents } from '../components/HideableBalance.jsx'

const LEDGER_LABEL = {
  transfer_sent: 'Transferencia enviada',
  transfer_received: 'Transferencia recebida',
  investment_deposit: 'Aporte em investimento',
  investment_withdraw: 'Retirada de investimento',
}

function isOutgoing(type) {
  return type === 'transfer_sent' || type === 'investment_deposit'
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Carregando...</p>
  if (!data) return <p className="feedback-error">Nao foi possivel carregar o dashboard.</p>

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="grid-2">
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2>Saldo</h2>
              <HideableBalance valueCents={data.balanceCents} />
            </div>
            <Link to="/extrato" className="btn-secondary">Extrato</Link>
          </div>

          <h2 style={{ marginTop: '1.5rem' }}>Historico de pagamentos</h2>
          {data.recentLedger.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Nenhum lancamento ainda.</p>
          ) : (
            <div className="list">
              {data.recentLedger.map((entry, i) => (
                <div className="list-item" key={i}>
                  <span>
                    {LEDGER_LABEL[entry.type]}
                    {entry.counterparty ? ` - ${entry.counterparty}` : ''}
                  </span>
                  <span className={isOutgoing(entry.type) ? 'amount-negative' : 'amount-positive'}>
                    {isOutgoing(entry.type) ? '-' : '+'}{formatCents(entry.amountCents)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/transferir" className="btn" style={{ flex: 1, textAlign: 'center' }}>Transferencia</Link>
            <Link to="/investir" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>Investimento</Link>
          </div>

          <h2 style={{ marginTop: '1.5rem' }}>Tabela de foguinho</h2>
          <p className="streak-badge">🔥 voce: {data.ownStreak.current} (recorde {data.ownStreak.record})</p>
          <div className="leaderboard-list">
            {data.friendsLeaderboard.map((entry) => (
              <div className="leaderboard-item" key={entry.userId}>
                <span>
                  <span className="leaderboard-rank">{entry.rank}º</span>
                  {entry.name}
                </span>
                <span className="streak-badge">🔥 {entry.current}</span>
              </div>
            ))}
          </div>
          <Link to="/amigos" style={{ display: 'inline-block', marginTop: '0.85rem' }}>
            Ver amigos
          </Link>
        </section>
      </div>
    </div>
  )
}
