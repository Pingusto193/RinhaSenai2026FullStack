import { useState, useEffect } from 'react'

const API = '/api'

const initialForm = {
  card_number: '',
  holder_name: '',
  expiration: '',
  cvv: '',
  amount_cents: '',
  installments: 1,
  description: '',
}

function formatCents(cents) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Dashboard() {
  const [form, setForm] = useState(initialForm)
  const [feedback, setFeedback] = useState(null)
  const [balance, setBalance] = useState(null)
  const [totals, setTotals] = useState({ approved: 0, declined: 0, refunded: 0 })
  const [submitting, setSubmitting] = useState(false)

  async function loadBalance() {
    const res = await fetch(`${API}/balance`)
    setBalance(await res.json())
  }

  async function loadTotals() {
    let page = 1
    let totalPages = 1
    const limit = 100
    const counts = { approved: 0, declined: 0, refunded: 0 }

    do {
      const res = await fetch(`${API}/transactions?page=${page}&limit=${limit}`)
      const data = await res.json()
      for (const tx of data.data ?? []) {
        if (counts[tx.status] !== undefined) counts[tx.status] += 1
      }
      totalPages = data.pagination?.total_pages ?? 1
      page += 1
    } while (page <= totalPages && page <= 20)

    setTotals(counts)
  }

  useEffect(() => {
    loadBalance()
    loadTotals()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setFeedback(null)

    try {
      const res = await fetch(`${API}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount_cents: Number(form.amount_cents),
          installments: Number(form.installments),
        }),
      })
      const data = await res.json()

      if (res.ok && data.status === 'approved') {
        setFeedback({ type: 'success', message: `Pagamento aprovado! ID ${data.id}` })
        setForm(initialForm)
      } else if (res.ok && data.status === 'declined') {
        setFeedback({ type: 'error', message: 'Pagamento recusado pela operadora.' })
      } else {
        setFeedback({ type: 'error', message: data.error ?? 'Erro ao processar pagamento.' })
      }

      await loadBalance()
      await loadTotals()
    } catch {
      setFeedback({ type: 'error', message: 'Falha de comunicacao com o servidor.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dashboard">
      <h1>Gateway de Pagamento</h1>

      <div className="dashboard-grid">
        <section className="card">
          <h2>Novo pagamento</h2>
          <form className="payment-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Numero do cartao</span>
              <input
                className="input-card-number"
                name="card_number"
                value={form.card_number}
                onChange={handleChange}
                maxLength={16}
                required
              />
            </label>

            <label className="field">
              <span>Nome do titular</span>
              <input
                className="input-holder-name"
                name="holder_name"
                value={form.holder_name}
                onChange={handleChange}
                maxLength={50}
                required
              />
            </label>

            <div className="field-row">
              <label className="field">
                <span>Validade (MM/AA)</span>
                <input
                  className="input-expiration"
                  name="expiration"
                  placeholder="MM/AA"
                  value={form.expiration}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span>CVV</span>
                <input
                  className="input-cvv"
                  name="cvv"
                  value={form.cvv}
                  onChange={handleChange}
                  maxLength={4}
                  required
                />
              </label>
            </div>

            <div className="field-row">
              <label className="field">
                <span>Valor (centavos)</span>
                <input
                  className="input-amount"
                  name="amount_cents"
                  type="number"
                  min="1"
                  value={form.amount_cents}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span>Parcelas</span>
                <select
                  className="select-installments"
                  name="installments"
                  value={form.installments}
                  onChange={handleChange}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}x</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field">
              <span>Descricao</span>
              <input
                className="input-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </label>

            <button className="btn-pay" type="submit" disabled={submitting}>
              {submitting ? 'Processando...' : 'Pagar'}
            </button>
          </form>

          {feedback?.type === 'success' && (
            <p className="feedback-success">{feedback.message}</p>
          )}
          {feedback?.type === 'error' && (
            <p className="feedback-error">{feedback.message}</p>
          )}
        </section>

        <section className="card balance-card">
          <h2>Resumo</h2>
          <div className="balance-list">
            <div className="balance-item">
              <span>Saldo liquido</span>
              <span className="display-balance" data-value={balance?.netCents ?? 0}>
                {formatCents(balance?.netCents ?? 0)}
              </span>
            </div>
            <div className="balance-item">
              <span>Aprovadas</span>
              <span className="display-total-approved" data-value={totals.approved}>
                {totals.approved}
              </span>
            </div>
            <div className="balance-item">
              <span>Recusadas</span>
              <span className="display-total-declined" data-value={totals.declined}>
                {totals.declined}
              </span>
            </div>
            <div className="balance-item">
              <span>Estornadas</span>
              <span className="display-total-refunded" data-value={totals.refunded}>
                {totals.refunded}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
