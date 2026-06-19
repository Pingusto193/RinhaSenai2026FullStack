import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { getDashboard } from '../api/dashboard.js'
import HideableBalance, { formatCents } from '../components/HideableBalance.jsx'
import BrandMark from '../components/BrandMark.jsx'
import DirectionIcon from '../components/DirectionIcon.jsx'

const PISO_INVESTIDO_CENTS = 1000

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
  const [showAbout, setShowAbout] = useState(false)

  useEffect(() => {
    getDashboard().then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Carregando...</p>
  if (!data) return <p className="feedback-error">Nao foi possivel carregar o dashboard.</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ marginBottom: 0 }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span className="floor-badge">
            <BrandMark size={16} />
            Piso investido: {formatCents(PISO_INVESTIDO_CENTS)}
          </span>
          <Link to="/amigos" className="floor-badge floor-badge-neutral">
            Amigos: {Math.max(data.friendsLeaderboard.length - 1, 0)}
          </Link>
        </div>
      </div>

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
                  <span className="list-item-main">
                    <DirectionIcon outgoing={isOutgoing(entry.type)} />
                    <span className="list-item-text">
                      {LEDGER_LABEL[entry.type]}
                      {entry.counterparty ? <small>{entry.counterparty}</small> : null}
                    </span>
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
          <p className="streak-badge">
            <BrandMark size={16} /> voce: {data.ownStreak.current} (recorde {data.ownStreak.record})
          </p>
          <div className="leaderboard-list">
            {data.friendsLeaderboard.map((entry) => (
              <div className="leaderboard-item" key={entry.userId}>
                <span>
                  <span className="leaderboard-rank">{entry.rank}º</span>
                  {entry.name}
                </span>
                <span className="streak-badge"><BrandMark size={16} /> {entry.current}</span>
              </div>
            ))}
          </div>
          <Link to="/amigos" style={{ display: 'inline-block', marginTop: '0.85rem' }}>
            Ver amigos
          </Link>
        </section>
      </div>

      <button type="button" className="link-button" onClick={() => setShowAbout((v) => !v)} style={{ marginTop: '1rem' }}>
        Sobre
      </button>
      {showAbout && (
        <p className="card" style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
          Flinx e uma carteira digital com investimentos simulados, transferencias entre amigos
          por codigo pessoal e o foguinho, que mede sua constancia mantendo dinheiro investido
          acima do piso minimo.
        </p>
      )}
    </div>
  )
}
