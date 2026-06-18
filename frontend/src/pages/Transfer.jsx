import { useState, useEffect } from 'react'
import { getSentTransfers, createTransfer } from '../api/transfers.js'
import { getAccount } from '../api/account.js'
import { formatCents } from '../components/HideableBalance.jsx'
import BalanceHeader from '../components/BalanceHeader.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Transfer() {
  const { refresh } = useAuth()
  const [personalCode, setPersonalCode] = useState('')
  const [myCode, setMyCode] = useState('')
  const [amount, setAmount] = useState('')
  const [recent, setRecent] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function loadRecent() {
    getSentTransfers(10).then(setRecent).catch(() => setRecent([]))
  }

  useEffect(() => {
    getAccount().then((acc) => setMyCode(acc.personalCode)).catch(() => {})
    loadRecent()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      const amountCents = Math.round(Number(amount) * 100)
      const transfer = await createTransfer(personalCode.trim().toUpperCase(), amountCents)
      setFeedback({ type: 'success', message: `Transferido para ${transfer.receiverName}!` })
      setPersonalCode('')
      setAmount('')
      loadRecent()
      refresh()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1>Transferencia</h1>
      <BalanceHeader />

      <div className="grid-2">
        <section className="card">
          <h2>Outros pagamentos</h2>
          {recent.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Nenhuma transferencia ainda.</p>
          ) : (
            <div className="list">
              {recent.map((t) => (
                <button
                  type="button"
                  className="list-item clickable list-item-button"
                  key={t.id}
                  onClick={() => setPersonalCode(t.receiverCodeSnapshot)}
                >
                  <span>{t.receiverName} - {new Date(t.createdAt).toLocaleTimeString('pt-BR')}</span>
                  <span className="amount-negative">-{formatCents(t.amountCents)}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2>Codigo pessoal de transferencia</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Codigo de quem vai receber</span>
              <input
                value={personalCode}
                onChange={(e) => setPersonalCode(e.target.value)}
                placeholder="ABCD1234"
                maxLength={8}
                required
              />
            </label>
            <label className="field">
              <span>Valor (R$)</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Transferindo...' : 'Transferir'}
            </button>
          </form>

          {feedback?.type === 'success' && <p className="feedback-success">{feedback.message}</p>}
          {feedback?.type === 'error' && <p className="feedback-error">{feedback.message}</p>}

          <h2 style={{ marginTop: '1.5rem' }}>Seu codigo pessoal</h2>
          <p className="code-display">{myCode || '...'}</p>
        </section>
      </div>
    </div>
  )
}
