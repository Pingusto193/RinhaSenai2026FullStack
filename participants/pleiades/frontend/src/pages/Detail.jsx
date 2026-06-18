import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router'

const API = '/api'

function formatCents(cents) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Detail() {
  const { id } = useParams()
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setNotFound(false)
    const res = await fetch(`${API}/transactions/${id}`)
    if (res.status === 404) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setTransaction(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleRefund() {
    await fetch(`${API}/transactions/${id}/refund`, { method: 'POST' })
    load()
  }

  if (loading) return <p>Carregando...</p>
  if (notFound) return <p className="feedback-error">Transacao nao encontrada.</p>

  return (
    <div className="detail">
      <Link to="/history" className="back-link">&larr; Voltar ao historico</Link>
      <h1>Detalhe da Transacao</h1>

      <div className="card detail-panel">
        <div className="detail-row">
          <span>ID</span>
          <span className="detail-id" data-value={transaction.id}>{transaction.id}</span>
        </div>
        <div className="detail-row">
          <span>Status</span>
          <span className={`detail-status status-${transaction.status}`} data-value={transaction.status}>
            {transaction.status}
          </span>
        </div>
        <div className="detail-row">
          <span>Valor</span>
          <span className="detail-amount" data-value={transaction.amount_cents}>
            {formatCents(transaction.amount_cents)}
          </span>
        </div>
        <div className="detail-row">
          <span>Bandeira</span>
          <span className="detail-brand" data-value={transaction.card_brand}>{transaction.card_brand}</span>
        </div>
        <div className="detail-row">
          <span>Titular</span>
          <span className="detail-holder" data-value={transaction.holder_name}>{transaction.holder_name}</span>
        </div>
        <div className="detail-row">
          <span>Cartao</span>
          <span className="detail-card" data-value={transaction.card_last4}>**** {transaction.card_last4}</span>
        </div>
        <div className="detail-row">
          <span>Parcelas</span>
          <span className="detail-installments" data-value={transaction.installments}>
            {transaction.installments}x
          </span>
        </div>
        <div className="detail-row">
          <span>Valor da parcela</span>
          <span className="detail-installment-amount" data-value={transaction.installment_amount}>
            {formatCents(transaction.installment_amount)}
          </span>
        </div>
        <div className="detail-row">
          <span>Total com juros</span>
          <span className="detail-total" data-value={transaction.total_with_interest}>
            {formatCents(transaction.total_with_interest)}
          </span>
        </div>
        <div className="detail-row">
          <span>Taxa</span>
          <span className="detail-fee" data-value={transaction.fee_cents}>
            {formatCents(transaction.fee_cents)}
          </span>
        </div>
        <div className="detail-row">
          <span>Valor liquido</span>
          <span className="detail-net" data-value={transaction.net_amount}>
            {formatCents(transaction.net_amount)}
          </span>
        </div>
        <div className="detail-row">
          <span>Descricao</span>
          <span className="detail-description" data-value={transaction.description}>
            {transaction.description}
          </span>
        </div>
        <div className="detail-row">
          <span>Data</span>
          <span className="detail-date" data-value={transaction.created_at}>
            {new Date(transaction.created_at).toLocaleString('pt-BR')}
          </span>
        </div>

        {transaction.status === 'approved' && (
          <button className="btn-refund" onClick={handleRefund}>
            Estornar
          </button>
        )}
      </div>
    </div>
  )
}
