import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { getLedger } from '../api/dashboard.js'
import { formatCents } from '../components/HideableBalance.jsx'
import DirectionIcon from '../components/DirectionIcon.jsx'

const LEDGER_LABEL = {
  transfer_sent: 'Transferencia enviada',
  transfer_received: 'Transferencia recebida',
  investment_deposit: 'Aporte em investimento',
  investment_withdraw: 'Retirada de investimento',
}

function isOutgoing(type) {
  return type === 'transfer_sent' || type === 'investment_deposit'
}

export default function Ledger() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)

  useEffect(() => {
    getLedger(page, 20)
      .then(setData)
      .catch(() => setData({ items: [], page, totalPages: 1 }))
  }, [page])

  return (
    <div>
      <Link to="/dashboard">&larr; Voltar</Link>
      <h1>Extrato</h1>

      <section className="card">
        {!data ? (
          <p>Carregando...</p>
        ) : data.items.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nenhum lancamento ainda.</p>
        ) : (
          <div className="list">
            {data.items.map((entry, i) => (
              <div className="list-item" key={i}>
                <span className="list-item-main">
                  <DirectionIcon outgoing={isOutgoing(entry.type)} />
                  <span className="list-item-text">
                    {LEDGER_LABEL[entry.type]}
                    {entry.counterparty ? ` - ${entry.counterparty}` : ''}
                    <small>{new Date(entry.createdAt).toLocaleString('pt-BR')}</small>
                  </span>
                </span>
                <span className={isOutgoing(entry.type) ? 'amount-negative' : 'amount-positive'}>
                  {isOutgoing(entry.type) ? '-' : '+'}{formatCents(entry.amountCents)}
                </span>
              </div>
            ))}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="pagination" style={{ marginTop: '1rem' }}>
            <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </button>
            <span>Pagina {data.page} de {data.totalPages}</span>
            <button className="btn-secondary" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
              Proximo
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
