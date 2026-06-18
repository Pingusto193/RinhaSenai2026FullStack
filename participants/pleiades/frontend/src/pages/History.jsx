import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router'

const API = '/api'

const STATUS_LABEL = {
  approved: 'Aprovada',
  declined: 'Recusada',
  refunded: 'Estornada',
}

function formatCents(cents) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function History() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1)
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit'), 10) || 10, 1), 100)

  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({ page, limit, total: 0, total_pages: 1 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`${API}/transactions?page=${page}&limit=${limit}`)
    const data = await res.json()
    setTransactions(data.data ?? [])
    setPagination(data.pagination ?? { page, limit, total: 0, total_pages: 1 })
    setLoading(false)
  }, [page, limit])

  useEffect(() => {
    load()
  }, [load])

  function goToPage(nextPage) {
    setSearchParams({ page: String(nextPage), limit: String(limit) })
  }

  async function handleRefund(id) {
    await fetch(`${API}/transactions/${id}/refund`, { method: 'POST' })
    load()
  }

  return (
    <div className="history">
      <h1>Historico de Transacoes</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="list-transactions">
          {transactions.map((tx) => (
            <div className="transaction-item card" key={tx.id}>
              <div className="transaction-row">
                <Link className="transaction-id" to={`/transaction/${tx.id}`} data-value={tx.id}>
                  {tx.id.slice(0, 8)}...
                </Link>
                <span className={`transaction-status status-${tx.status}`} data-value={tx.status}>
                  {STATUS_LABEL[tx.status] ?? tx.status}
                </span>
              </div>

              <div className="transaction-row">
                <span className="transaction-amount" data-value={tx.amount_cents}>
                  {formatCents(tx.amount_cents)}
                </span>
                <span className="transaction-brand" data-value={tx.card_brand}>{tx.card_brand}</span>
                <span className="transaction-card" data-value={tx.card_last4}>**** {tx.card_last4}</span>
              </div>

              <div className="transaction-row">
                <span className="transaction-installments" data-value={tx.installments}>
                  {tx.installments}x
                </span>
                <span className="transaction-installment-amount" data-value={tx.installment_amount}>
                  {formatCents(tx.installment_amount)}
                </span>
                <span className="transaction-total" data-value={tx.total_with_interest}>
                  {formatCents(tx.total_with_interest)}
                </span>
                <span className="transaction-fee" data-value={tx.fee_cents}>
                  {formatCents(tx.fee_cents)}
                </span>
              </div>

              <div className="transaction-row">
                <span className="transaction-description" data-value={tx.description}>
                  {tx.description}
                </span>
                <span className="transaction-date" data-value={tx.created_at}>
                  {new Date(tx.created_at).toLocaleString('pt-BR')}
                </span>
              </div>

              {tx.status === 'approved' && (
                <button className="btn-refund" onClick={() => handleRefund(tx.id)}>
                  Estornar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="pagination">
        <button className="btn-prev-page" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
          Anterior
        </button>
        <span className="pagination-current" data-value={pagination.page}>
          Pagina {pagination.page}
        </span>
        <span className="pagination-pages" data-value={pagination.total_pages}>
          de {pagination.total_pages}
        </span>
        <span className="pagination-total" data-value={pagination.total}>
          ({pagination.total} transacoes)
        </span>
        <button
          className="btn-next-page"
          onClick={() => goToPage(page + 1)}
          disabled={page >= pagination.total_pages}
        >
          Proximo
        </button>
      </div>
    </div>
  )
}
