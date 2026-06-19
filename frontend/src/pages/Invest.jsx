import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { getInvestment, setInvestmentType, depositInvestment, withdrawInvestment } from '../api/investments.js'
import HideableBalance from '../components/HideableBalance.jsx'
import BalanceHeader from '../components/BalanceHeader.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Invest() {
  const { refresh } = useAuth()
  const [investment, setInvestment] = useState(null)
  const [amount, setAmount] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function load() {
    return getInvestment()
      .then(setInvestment)
      .catch((err) => setFeedback({ type: 'error', message: err.message }))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleTypeChange(type) {
    await setInvestmentType(type)
    load()
  }

  async function handleDeposit(event) {
    event.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      const amountCents = Math.round(Number(amount) * 100)
      await depositInvestment(amountCents)
      setFeedback({ type: 'success', message: 'Aporte realizado!' })
      setAmount('')
      await load()
      refresh()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleWithdraw(event) {
    event.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      const amountCents = Math.round(Number(amount) * 100)
      await withdrawInvestment(amountCents)
      setFeedback({ type: 'success', message: 'Retirada realizada!' })
      setAmount('')
      await load()
      refresh()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (!investment) {
    return feedback?.type === 'error'
      ? <p className="feedback-error">{feedback.message}</p>
      : <p>Carregando...</p>
  }

  return (
    <div>
      <h1>Investimento</h1>
      <BalanceHeader />

      <div className="grid-2">
        <section className="card">
          <h2>Investido</h2>
          <div className="card card-success">
            <HideableBalance valueCents={investment.principalCents} />
          </div>
          <Link to="/investir/grafico" style={{ display: 'inline-block', marginTop: '0.85rem' }}>
            Ver grafico ao longo do tempo
          </Link>
        </section>

        <section className="card">
          <h2>Selecionar a forma de investimento</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              type="button"
              className={investment.type === 'FIXED' ? 'btn' : 'btn-secondary'}
              onClick={() => handleTypeChange('FIXED')}
            >
              Renda Fixa - 10,5% por ano
            </button>
            <button
              type="button"
              className={investment.type === 'VARIABLE' ? 'btn' : 'btn-secondary'}
              onClick={() => handleTypeChange('VARIABLE')}
            >
              Renda Variavel - varia por mes
            </button>
          </div>
        </section>
      </div>

      <section className="card" style={{ marginTop: '1.25rem' }}>
        <h2>Selecionar quantia</h2>
        <form className="form" onSubmit={handleDeposit}>
          <label className="field">
            <span>Valor (R$)</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn-success" disabled={submitting || !amount}>
              Confirmar aporte
            </button>
            <button type="button" className="btn-secondary" onClick={handleWithdraw} disabled={submitting || !amount}>
              Retirar
            </button>
          </div>
        </form>

        {feedback?.type === 'success' && <p className="feedback-success">{feedback.message}</p>}
        {feedback?.type === 'error' && <p className="feedback-error">{feedback.message}</p>}
      </section>
    </div>
  )
}
