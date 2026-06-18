import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getRecentExpenses, getExpensesAggregate } from '../api/expenses.js'
import PeriodFilter from '../components/PeriodFilter.jsx'
import { formatCents } from '../components/HideableBalance.jsx'
import BalanceHeader from '../components/BalanceHeader.jsx'

export default function Expenses() {
  const [period, setPeriod] = useState('month')
  const [recent, setRecent] = useState([])
  const [aggregate, setAggregate] = useState([])

  useEffect(() => {
    getRecentExpenses(10).then(setRecent).catch(() => setRecent([]))
  }, [])

  useEffect(() => {
    getExpensesAggregate(period).then(setAggregate).catch(() => setAggregate([]))
  }, [period])

  return (
    <div>
      <h1>Gastos</h1>
      <BalanceHeader />

      <div className="grid-2">
        <section className="card">
          <h2>Ultimos gastos</h2>
          {recent.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Nenhum gasto ainda.</p>
          ) : (
            <div className="list">
              {recent.map((t) => (
                <div className="list-item" key={t.id}>
                  <span>{t.receiverName} - {new Date(t.createdAt).toLocaleDateString('pt-BR')}</span>
                  <span className="amount-negative">-{formatCents(t.amountCents)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Gastos por periodo</h2>
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>

          <div className="chart-card">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregate}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="bucketKey" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => formatCents(v)} width={90} />
                <Tooltip
                  formatter={(value) => formatCents(value)}
                  contentStyle={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="totalCents" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  )
}
